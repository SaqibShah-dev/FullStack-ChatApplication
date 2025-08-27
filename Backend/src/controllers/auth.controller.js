import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloundinary.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // ✅ Call it like this
generateToken(user._id, res); // It sets cookie inside

res.status(201).json({
  message: "User registered successfully",
  user: {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
  },
});


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  const {email,password} = req.body;
  try {
    const user =  await User.findOne({email});
    if(!user){
      return res.status(400).json({message : "Invalid crenditals"})
    }
    const isPasswordCorrect = await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({message : "Invalid crenditals"});
    }
    generateToken(user._id,res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })
    
  } catch (error) {
    console.log("Error in auth  controllers ",error.message);
    return res.status(500).json({message : "Internal Server Error"});
    
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt","",{maxAge: 0});
    res.status(200).json({message : "Logged Out Successfully "})
  } catch (error) {
    console.log("Error in Logout controllers ");
    res.status(500).json({message: "Internal Server Error "})
  }
};


export const updateProfile = async (req,res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id
    if(!profilePic){
      return res.status(400).json({message: "Profile pic is required"});
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic, {
  folder: "profile_pics",
});


const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true}).select("-password")
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in Update Profile : ",error);
    res.status(500).json({message: "Internal Server Error "});
  }
};

export const checkAuth = async (req,res) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    console.log("Error in check auth controller : ",error);
    res.status(500).json({message: "Internal Server Error "})
  }
}