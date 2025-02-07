import { generateToken } from '../lib/utils.js';
import User from '../models/user.models.js'
import bcrypt from 'bcryptjs'
import { deleteImageFromSupabase, uploadImageToSupabase } from '../lib/supabase.js';
import fs from 'fs'

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 8) return res.status(400).json({message: "Password length should be atleast 8"})

        const finduser = await User.findOne({email})
        if(finduser) return res.status(400).json({message: "Email already exists"});

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = new User({
            fullName, email, password: hashedPassword
        })

        if(user) {
            generateToken(user._id, res)
            await user.save()

            return res.status(201).json({message: "User created successfully", user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic
            }});
        }
        return res.status(400).json({message: "Invalid user data"});
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);
        const userObject = user.toObject();
        delete userObject.password;

        return res.status(200).json({
            message: "Login successfull", user: userObject
        })
    } catch (error) {
        console.log('Error in login controller', error.message)
        return res.status(500).json({error: "Internal server error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        return res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller", error.message)
        return res.status(500).json({error: "Internal server error"})
    }
}

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

        let profilePath = user.filePath;
        if (profilePath) {
            await deleteImageFromSupabase(profilePath);
        }

        const {publicUrl, filePath} = await uploadImageToSupabase(req.file.originalname);
        if (!publicUrl) {
            return res.status(500).json({ message: 'Profile upload at database failed' });
        }

        const imageUpdate = await User.updateOne(
            { _id: userId },
            { $set: { 
                profilePic: publicUrl,
                filePath: filePath
             } }
        );

        fs.unlinkSync(req.file.path);

        if (!imageUpdate) {
            return res.status(400).json({ message: "Profile update failed" });
        }

        user.profilePic = publicUrl;
        user.filePath = filePath;

        delete user.password

        return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Update Profile Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const checkAuth = (req, res) => {
    try {  
      return res.status(200).json({
        user: req.user
      });
    } catch (error) {
      console.error("Error in checkAuth controller:", error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};
  