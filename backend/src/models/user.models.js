import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    connectionCode: {
        type: String,
        required: true,
        unique: true,
    },
    connectedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profilePic: {
        type: String,
        default: ''
    },
    watchHistory: [{
        type: String,
    }],
    about: {
        type: String,
        default: ''
    },
    spaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Space'
    }]
}, {timestamps: true})

export const User = mongoose.model('User', userSchema)
export default User;