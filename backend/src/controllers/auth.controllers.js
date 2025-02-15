import { generateToken } from '../lib/utils.js';
import User from '../models/user.models.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 8) return res.status(400).json({ message: "Password length should be atleast 8"})

        const finduser = await User.findOne({email})
        if(finduser) return res.status(400).json({ message: "Email already exists"});

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const connectionCode = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        
        const user = new User({
            fullName, email, password: hashedPassword, connectionCode
        })

        if(user) {
            generateToken({userId: user._id}, res)
            await user.save()

            return res.status(201).json({ message: "User created successfully", user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
                connectionCode
            }});
        }
        return res.status(400).json({ message: "Invalid user data"});
    } catch (error) {
        console.log('Error in signup controller: ', error.message)
        return res.status(500).json({ message: "Internal server error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials"});
        }

        generateToken({userId: user._id}, res)
        const userObject = user.toObject();
        delete userObject.password;

        return res.status(200).json({
            message: "Login successfull", user: userObject
        })
    } catch (error) {
        console.log('Error in login controller', error.message)
        return res.status(500).json({ message: "Internal server error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0})
        return res.status(200).json({ message: "Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller", error.message)
        return res.status(500).json({ message: "Internal server error"})
    }
}

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
  