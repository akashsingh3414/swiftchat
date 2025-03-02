import { deleteVideoFromCloudinary, uploadVideoToCloudinary } from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
import Space from '../models/space.models.js';
import User from '../models/user.models.js';

export const uploadVideo = async (req, res) => {
    try {
        const receiverId = req.body.receiverId;
        const hostId = req.user.id;
        
        const space = await Space.findById(receiverId.toString());
        let user;
        if (!space) {
            user = await User.findById(receiverId.toString());
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No video file received' });
        }

        console.log("received video for streaming");

        const uploadResponse = await uploadVideoToCloudinary(req.file.path);
        console.log("video public url", uploadResponse)
        const streamUrl = uploadResponse.publicUrl;

        if (space) {
            io.to(space._id.toString()).emit('new-stream', { hostId, streamUrl, spaceId: receiverId });
        } else {
            const receiverSocketId = getReceiverSocketId(user._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('new-stream', { hostId, streamUrl });
            }
        }

        return res.status(201).json({ message: 'Stream started', hostId, streamUrl });
    } catch (error) {
        console.log('Error in upload video controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const userId = req.user.id;
        const streamUrl = req.body.streamUrl;
        const hostId = req.body.hostId;
        const spaceId = req.body.spaceId;

        console.log(userId)
        console.log(streamUrl)
        console.log(hostId)
        console.log(spaceId)

        const user = await User.findById(userId);
        const host = await User.findById(hostId);
        const space = await Space.findById(spaceId);

        if(!user || !host) {
            return res.status(400).json({message: 'Invalid user id'});
        }

        if(!space) {
            return res.status(400).json({message: 'Invalid space id'});
        }

        if(user._id.toString() !== host._id.toString()) return res.status(403).json({message: "Action not allowed"});
        await deleteVideoFromCloudinary(streamUrl);
        io.to(spaceId).emit('stream-ended', {spaceId});

        return res.status(200).json({message: "Stream ended"});
    } catch (error) {
        console.log('Error in delete video controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
