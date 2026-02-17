import {Router,type Request,type Response} from "express";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

const router = Router();

const JWT_SECRET=process.env.JWT_SECRET || "mysecret";

router.post("/register",async (req:Request,res:Response)=>{
    const {email,password} = req.body;

    try{
        const exists = await User.findOne({email});
        
        if(exists){
            return res.status(409).json({message:"User already exists"});
        }
        
        const hashed = await bcrypt.hash(password,10);

        const user = await User.create({
            email,
            password : hashed,
        });
        res.json({message:"User has been created",userId:user._id});
    }catch(err){
        res.status(500).json({message:"Server Error"})
    }
})

router.post("/login",async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({message:"User doesnt exist"})
        }

        const match = await bcrypt.compare(password,user.password);
        if(!match) return res.status(400).json({message:"Invalid password"});
        const token = jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:"1h"})
        res.json({token});
    }catch(err){
        res.status(500).json({message : "Server error"});
    }
})

export default router;