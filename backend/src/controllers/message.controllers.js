import User from "../models/user.models.js"
import Message from "../models/message.models.js";
import { uploadImageToSupabase } from "../lib/supabase.js";
import fs from 'fs'
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUser}}).select('-password')

        res.status(200).json({message: 'Users fetched successfully', users: filteredUsers})
    } catch (error) {
        console.log('Error in getUsersForSidebar: ', error.message)
        res.status(500).json({error: "Internal server error"})
    }
}

export const getMessages  = async (req, res) => {
    const { id: userToChat } = req.params
    try {
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userToChat},
                {senderId: userToChat, receiverId: myId}
            ]
        })

        res.status(200).json({messages})
    } catch (error) {
        console.log('Error in getMessages controller: ',error.message)
        return res.status(500).json({error: 'Internal server error'})
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl, filePathUrl; 
        
        if(req.file) {
            const {publicUrl, filePath} = await uploadImageToSupabase(req.file.originalname);
            imageUrl = publicUrl;
            filePathUrl = filePath

            if (req.file.path) {
                fs.unlinkSync(req.file.path);
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text: text ? text : '',
            image: imageUrl,
            filePath: filePathUrl
        })

        await newMessage.save()

        //realtime functionality here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.status(201).json({message: newMessage})

    } catch (error) {
        console.log('Error in send message controller: ', error.message)
        res.status(500).json({error: "Internal server error"})
    }
}