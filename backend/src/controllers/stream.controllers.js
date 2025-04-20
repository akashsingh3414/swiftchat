import { deleteVideoFromCloudinary, uploadVideoToCloudinary } from '../lib/cloudinary.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
import Space from '../models/space.models.js';
import Stream from '../models/stream.models.js';
import User from '../models/user.models.js';

export const uploadVideo = async (req, res) => {
    try {
        const receiverId = req.body.receiverId;
        const hostId = req.user.id;
        
        const space = await Space.findById(receiverId.toString());
        if (!space) {
            return res.status(400).json({ message: 'Invalid space id' });
        }

        const user = await User.findById(hostId);

        if (!req.file) {
            return res.status(400).json({ message: 'No video file received' });
        }

        console.log("received video for streaming");

        const uploadResponse = await uploadVideoToCloudinary(req.file.path);
        console.log("video public url", uploadResponse)
        const streamUrl = uploadResponse.publicUrl;

        const stream = new Stream({
            streamerId: hostId,
            spaceId: space._id,
            viewers: [
              {
                user: hostId,
                fullName: user.fullName,
                joinedAt: [new Date()]
              }
            ]
          });
          
          await stream.save();          

          io.to(space?._id.toString()).emit('new-stream', { hostId, streamUrl, spaceId: receiverId });

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

        const user = await User.findById(userId);
        const host = await User.findById(hostId);
        const space = await Space.findById(spaceId);

        if (!user || !host) {
            return res.status(400).json({ message: 'Invalid user or host id' });
        }

        if (!space) {
            return res.status(400).json({ message: 'Invalid space id' });
        }

        if (user._id.toString() !== host._id.toString()) {
            return res.status(403).json({ message: "Action not allowed" });
        }
        await deleteVideoFromCloudinary(streamUrl);
        io.to(spaceId).emit('stream-ended', { spaceId, streamUrl });

        const stream = await Stream.find({ 
            spaceId: spaceId, 
            streamerId: hostId 
        });
        
        if (!stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        return res.status(200).json({
            message: "Stream ended",
        });

    } catch (error) {
        console.log('Error in end stream controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStreams = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        const streams = await Stream.find({ streamerId: userId });

        if (!user) {
            return res.status(400).json({ message: 'Invalid user id' });
        }

        if (!streams) {
            return res.status(404).json({ message: 'No streams found' });
        }

        return res.status(200).json({
            message: "Stream fetched successfully",
            streams
        });

    } catch (error) {
        console.log('Error in get stream controller:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteStream = async (req, res) => {
    try {
        const streamId = req.params.streamId;
        console.log(streamId)
        await Stream.findByIdAndDelete(streamId);
        return res.status(200).json({message: 'Stream record deleted successfully'});
    } catch (error) {
        console.log('Error in delete stream controller:', error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
}