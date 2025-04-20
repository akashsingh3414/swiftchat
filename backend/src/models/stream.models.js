import mongoose from "mongoose";
 
  const viewerSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    joinedAt: [Date],
    leftAt: [Date]
  }, { _id: false });
  
  const streamSchema = new mongoose.Schema({
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: true
    },
    streamerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    viewers: [viewerSchema]
  }, { timestamps: true });

const Stream = mongoose.model("Stream", streamSchema);

export default Stream;
