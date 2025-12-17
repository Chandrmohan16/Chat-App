import bcrypt from 'bcryptjs';
import User from '../modules/User.js';
import { generateToken } from '../lib/utils.js';
import cloudinary from '../lib/cloudinary.js';

// Sigup a new user
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }

        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);
        

        res.json({ success: true, userData: newUser, token, 
            message: "User registered successfully" 
        });

    } catch (error) {
        console.error("Signup error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Controller to login a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        // if (!userData) {
        //     return res.status(400).json({ success: false, message: "Invalid Credentials" });
        // }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect){
            return res.json({ success: false, message: "Invalid Credentials" });
        }
        
        const token = generateToken(userData._id);

        // const userWithoutPassword = userData.toObject();
        // delete userWithoutPassword.password;

        res.json({ success: true, userData, token, message: "Login successful" }); 
    }catch (error) {
        console.error("Login error:", error.message);
        res.json({ success: false, message: error.message });
    }
}

// Controller to check user authentication status
export const checkAuth = (req, res) => {
    res.json({ success: true, user: req.user });
}

// Controller to update user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio ,fullName} = req.body;

        const userId = req.user._id;
        let updatedUser;
        
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        
        // const userWithoutPassword = updatedUser.toObject();
        // delete userWithoutPassword.password; 
        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.json({ success: false, message: error.message });
    }
}