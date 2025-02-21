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
    watchHistory: {
        type: [{
            host: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            title: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }]
    },
    acceptingInvites: {
        type: Boolean,
        required: true,
        default: true,
    }
}, { timestamps: true });

const Space = mongoose.model('Space', spaceSchema);

export default Space;
