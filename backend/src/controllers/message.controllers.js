import User from "../models/user.models.js"
import Message from "../models/message.models.js";
import Space from "../models/space.models.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user.id;
        const user = await User.findById(loggedInUser).populate('connectedUsers', '-password');

        res.status(200).json({message: 'Users fetched successfully', users: user.connectedUsers })
    } catch (error) {
        console.log('Error in getUsersForSidebar: ', error.message)
        res.status(500).json({error: "Internal server error"})
    }
}

export const getMessagesForUser  = async (req, res) => {
    const { id: userToChat } = req.params
    try {
        const myId = req.user.id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChat},
                {senderId: userToChat, receiverId: myId}
            ]
        })

        res.status(200).json({messages})
    } catch (error) {
        console.log('Error in getMessagesForUser controller: ',error.message)
        return res.status(500).json({error: 'Internal server error'})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const text = req.body.text;
        const receiverId = req.params.addressId;
        const senderId = req.user.id;

        const space = await Space.findById(receiverId.toString())
        let user;
        if(!space) {
            user = await User.findById(receiverId.toString());
        }

        let imageUrl;

        if(!text && !req.file) {
            return res.status(400).json({message: "This action is not allowed"})
        }

        if (req.file) {
            const res = await uploadImageToCloudinary(req.file.path);
            imageUrl = res.publicUrl
        }

        const newMessage = new Message({
            senderId,
            text: text ? text : '',
            image: imageUrl,
            spaceId: space ? space._id : null,
            receiverId: !space ? user._id : null,
        })

        await newMessage.save()
        if(space) {
            io.to(space._id.toString()).emit('newMessage', newMessage);
        } else {
            const receiverSocketId = getReceiverSocketId(user._id);
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('newMessage', newMessage);
            }
        }
        return res.status(201).json({message: newMessage})

    } catch (error) {
        console.log('Error in send message controller: ', error.message)
        return res.status(500).json({error: "Internal server error"})
    }
}

export const deleteUserMessages = async (req, res) => {
    const userId = req.user.id;
    const receiverId = req.body.receiverId;

    try {
        const user = await User.findById(userId);
        const receiver = await User.findById(receiverId);

        if (!user || !receiver) return res.status(400).json({ message: 'Invalid user id' });

        const messages = await Message.find({
            senderId: user._id,
            receiverId: receiver._id
        });

        for (const message of messages) {
            if (message.image) {
                await deleteImageFromCloudinary(message.image);
            }
        }

        await Message.deleteMany({ senderId: user._id, receiverId: receiver._id });

        return res.status(200).json({ message: 'Messages deleted successfully' });

    } catch (error) {
        console.log('Error in delete user messages controller:', error);
        return res.status(500).json({ message: 'Internal error occurred while deleting user messages' });
    }
};

export const deleteAllMessages = async (req, res) => {
    const spaceId = req.body.spaceId;
    const userId = req.user.id;

    try {
        if (!spaceId) {
            return res.status(400).json({ message: "Space id is required" });
        }

        const space = await Space.findById(spaceId);
        if (!space) return res.status(400).json({ message: 'Invalid space id' });

        if (space.creator.toString() !== userId) {
            return res.status(403).json({ message: 'Request not allowed to non-admins' });
        }

        const messages = await Message.find({ spaceId });

        for (const message of messages) {
            if (message.image) {
                await deleteImageFromCloudinary(message.image);
            }
        }

        await Message.deleteMany({ spaceId });

        return res.status(200).json({ message: 'Messages deleted successfully' });

    } catch (error) {
        console.log('Error in delete all messages controller:', error);
        return res.status(500).json({ message: 'Internal error occurred while deleting all messages' });
    }
};
