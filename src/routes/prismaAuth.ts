import {Router,type Request, type Response} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../prisma.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register",async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        const user = await prisma.user.findUnique({where:{email}});
        if(user) return res.status(409).json({message:"User already exists"});

        const hashed = await bcrypt.hash(password,10)

        const newUser = await prisma.user.create({
            data : {
                email,
                password : hashed,
            }
        })
        res.json({message:"User created in MySql: ", userId : newUser.id})
    }catch(err){
        return res.status(500).json({message : "Internal Server Error" , err});
    }
});

router.post("/login",async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        const user = await prisma.user.findUnique({where:{email}});
        if(!user) return res.status(404).json({message:"User Not Found , Invalid credentials"});

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

        const token = jwt.sign({userId:user.id},JWT_SECRET as string,{expiresIn:"1h"})
        res.json({token});
    }catch(err){
        return res.status(500).json({message:"Server Error"});
    }

})

export default router;