import mongoose from "mongoose";

const spaceSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    name: {
        type: String,
        required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    spaceCode: {       
        type: String,
        required: true,
        unique: true,
    },
    acceptingInvites: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

const Space = mongoose.model('Space', spaceSchema)

export default Space;