import fs from 'fs'
import User from '../models/user.models.js';
import Message from '../models/message.models.js';
import Space from '../models/space.models.js';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../lib/cloudinary.js';

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Image file not provided" });
        }

        if (user.profilePic) {
            await deleteImageFromCloudinary(user.profilePic);
        }

        const {publicUrl} = await uploadImageToCloudinary(req.file.originalname);
        if (!publicUrl) {
            return res.status(500).json({ message: 'Profile upload at database failed' });
        }

        const imageUpdate = await User.updateOne(
            { _id: userId },
            { $set: { 
                profilePic: publicUrl,
             } }
        );

        fs.unlinkSync(req.file.path);

        if (!imageUpdate) {
            return res.status(400).json({ message: "Profile update failed" });
        }

        user.profilePic = publicUrl;

        delete user.password

        return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const connectUser = async (req, res) => {
    const userId = req.user.id;
    const connectionCode = req.params.connectionCode;

    if (!connectionCode) {
        return res.status(400).json({ message: 'Connection code is required' });
    }

    try {
        const user = await User.findById(userId);
        const targetUser = await User.findOne({ connectionCode });

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user?._id.equals(targetUser?._id)) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

       if (user.connectedUsers.includes(targetUser?._id)) {
            return res.status(400).json({ message: "Already connected to this user" });
        }

        if (connectionCode !== targetUser.connectionCode) {
            return res.status(400).json({ message: "Connection code didn't match" });
        }

        user.connectedUsers.push(targetUser?._id);
        targetUser.connectedUsers.push(user?._id);

        await user.save();
        await targetUser.save();

        return res.status(200).json({ message: "Connection successful", user: targetUser});
    } catch (error) {
        console.error("Error in connectUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeConnection = async (req, res) => {
    const userId = req.user.id;
    const connectionCode = req.body.connectionCode;

    try {
        const user = await User.findById(userId);
        const targetUser = await User.find({connectionCode});

        const targetuser = targetUser[0]
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!(user.connectedUsers.includes(targetuser?._id))) {
            return res.status(400).json({ message: "User not found. Already removed" });
        }

        user.connectedUsers = user.connectedUsers.filter(id => id.toString() !== targetuser?._id.toString());

        targetuser.connectedUsers = targetuser.connectedUsers.filter(id => id.toString() !== userId);

        await user.save();
        await targetuser.save();

        return res.status(200).json({message: " Removed connection successfully"});
    } catch (error) {
        console.error("Error in connectUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.updateMany(
            { _id: { $in: user.connectedUsers } },
            { $pull: { connectedUsers: userId } }
        );

        await Message.deleteMany({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        });

        await Space.updateMany(
            { _id: { $in: user.spaces } },
            { $pull: { members: userId } }
        );

        if (user.profilePic) {
            await deleteImageFromCloudinary(user.profilePic);
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};