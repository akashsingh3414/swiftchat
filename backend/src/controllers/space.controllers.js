import Message from "../models/message.models.js";
import Space from "../models/space.models.js";
import User from "../models/user.models.js";
import crypto from 'crypto'

export const createSpace = async (req, res) => {
    const userId = req.user.id;
    const spaceName = req.body.spaceName;

    try {
        if(!spaceName) {
            return res.status(400).json({message: 'Space name is required'})
        }

        const spaceCode = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

        const space = new Space({
            creator: userId,
            name: spaceName,
            spaceCode,
            members: [userId],
        })

        const user = await User.findById(userId).select('-password')
        user.spaces.push(space._id);
    
        await space.save()
        await user.save()
    
        return res.status(201).json({
            message: 'Space created successfully',
            space: {
                _id: space._id,
                name: space.name,
                spaceCode: space.spaceCode,
                creator: space.creator,
            },
            user
        })
    } catch (error) {
        console.log('Error in create space controller')
        return res.status(500).json({message: 'Internal error occured while creating space'})
    }
};

export const connectToSpace = async (req, res) => {
    const userId = req.user.id;
    const { spaceCode } = req.params;

    try {
        if (!spaceCode) {
            return res.status(400).json({ message: "Connection code is required" });
        }

        const space = await Space.findOne({ spaceCode });
        if (!space) {
            return res.status(404).json({ message: "Space not found" });
        }

        if(!space.acceptingInvites) return res.status(400).json({message: 'Space is not accepting invites'})

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (space.members.includes(userId)) {
            return res.status(400).json({ message: "User is already a member of this space" });
        }

        space.members.push(userId);
        user.spaces.push(space._id);

    
        await user.save();
        await space.save();

        return res.status(200).json({
            message: "Successfully joined the space",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                spaces: user.spaces
            },
            space: {
                _id: space._id,
                name: space.name,
                members: space.members,
                spaceCode: space.spaceCode
            }
        });

    } catch (error) {
        console.error("Error in connectToSpace:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const leaveSpace = async (req, res) => {
    const userId = req.user.id;
    const spaceCode = req.body.spaceCode;

    try {
        const space = await Space.findOne({spaceCode});
        if (!space) {
            return res.status(404).json({ message: "Space not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.spaces = user.spaces.filter(id => id.toString() !== space._id.toString());
        await user.save();

        if(space.members.length === 0) {
            await Message.deleteMany({spaceId: space._id});
            await Space.findByIdAndDelete(space._id);
            return res.status(200).json({message: "0 member, space deleted"})
        }

        if (!space.members.includes(userId)) {
            return res.status(400).json({ message: "User is not a member of this space" });
        }

        space.members = space.members.filter(id => id.toString() !== userId);
        await space.save();

        return res.status(200).json({ message: "Successfully left the space" });

    } catch (error) {
        console.error("Error in leaveSpace:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteSpace = async (req, res) => {
    const userId = req.user.id;
    const spaceId = req.body.spaceId;

    try {
        const space = await Space.findById(spaceId);
        if (!space) {
            return res.status(404).json({ message: "Space not found" });
        }

        if (space.creator.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized: Only the creator can delete the space" });
        }

        await User.updateMany(
            { _id: { $in: space.members } },
            { $pull: { spaces: spaceId } }
        );

        await Message.deleteMany({spaceId});
        await Space.findByIdAndDelete(spaceId);

        return res.status(200).json({ message: "Space deleted successfully" });

    } catch (error) {
        console.error("Error in deleteSpace:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getSpacesForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user.id;
        const spaces = await User.findById(loggedInUser).populate('spaces');

        res.status(200).json({message: 'All spaces fetched successfully', spaces: spaces.spaces })
    } catch (error) {
        console.log('Error in getUsersForSidebar: ', error.message)
        res.status(500).json({error: "Internal server error"})
    }
};

export const modifyInvite = async (req, res) => {
    const userId = req.user.id;
    const {spaceId, change} = req.body;
    try {
        const user = await User.findById(userId);
        if(!user) return res.status(400).json({message: 'User not found'});

        const space = await Space.findById(spaceId);

        if(!space) return res.status(400).json({message: 'Space not found'});

        space.acceptingInvites = change;

        await space.save();

        res.status(200).json({message: 'modified invite settings', space })

    } catch (error) {
        console.log('Error in modifyInvites: ', error.message)
        res.status(500).json({error: "Internal server error while updating invite settings"})
    }
};

export const getMessagesForSpace  = async (req, res) => {
    const spaceId = req.params.spaceId;
    try {
        const messages = await Message.find({receiverId: spaceId})

        res.status(200).json({messages})
    } catch (error) {
        console.log('Error in getMessagesForUser controller: ',error.message)
        return res.status(500).json({error: 'Internal server error'})
    }
}