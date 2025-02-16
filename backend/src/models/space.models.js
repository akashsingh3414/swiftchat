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
            title: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }],
        // default: [{
        //     title: "Default Video",
        //     url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        // }]
    },
    acceptingInvites: {
        type: Boolean,
        required: true,
        default: true,
    }
}, { timestamps: true });

const Space = mongoose.model('Space', spaceSchema);

export default Space;
