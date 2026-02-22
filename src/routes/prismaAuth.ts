import {Router,type Request, type Response} from "express";
import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
import argon2 from "argon2";
import prisma from "../prisma.js";
import { generateAccess , generateRefresh, revokeRefresh, storeRefresh } from "../utils/tokens.js";
import { pseudoRandomBytes } from "node:crypto";
import session from "express-session";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

router.post("/register",async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        const user = await prisma.user.findUnique({where:{email}});
        if(user) return res.status(409).json({message:"User already exists"});

        // const hashed = await bcrypt.hash(password,10)
        const hashed = await argon2.hash(password);

        const newUser = await prisma.user.create({
            data : {
                email,
                password : hashed,
            }
        })
         const accessToken = generateAccess(newUser.id);
         const refreshToken = generateRefresh(newUser.id);
         await storeRefresh(newUser.id , refreshToken);

        res.json({message:"User created in MySql: ", userId : newUser.id , accessToken,refreshToken})
    }catch(err){
        return res.status(500).json({message : "Internal Server Error" , err});
    }
});

router.post("/login",async(req:Request,res:Response)=>{
    const {email,password} = req.body;
    try{
        const user = await prisma.user.findUnique({where:{email}});
        if(!user) return res.status(404).json({message:"User Not Found , Invalid credentials"});

        // const isMatch = await bcrypt.compare(password,user.password);
        const isMatch = await argon2.verify(user.password,password)
        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

        const accessToken = generateAccess(user.id);
        const refreshToken = generateRefresh(user.id);

        await storeRefresh(user.id,refreshToken)

        const secret = process.env.JWT_SECRET || "basicauthentication";

        const token = jwt.sign(
            { userId: user.id }, 
            secret, 
            { expiresIn: "1h" }
        );
        res.json({token,accessToken,refreshToken});
    }catch(err){
        return res.status(500).json({message:"Server Error"});
    }

})

router.post("/refresh",async(req:Request,res:Response)=>{
    const {token} = req.body;
    if(!token) return res.status(401).json({message:"Token not found"});
    const stored = await prisma.refreshToken.findUnique({
        where : {token}
    });
    if(!stored || stored.revoked){
        return res.status(401).json({message : "Invalid refresh token"});

    }

    try {
        const payload = jwt.verify(token,REFRESH_TOKEN_SECRET) as {userId:number}
        await revokeRefresh(token);

        const newAccess = generateAccess(payload.userId);
        const newRefresh = generateRefresh(payload.userId);
        await storeRefresh(payload.userId,newRefresh);
        res.json({
            accessToken : newAccess,
            refreshToken : newRefresh
        })

    }catch(err){
        res.status(500).json({message:"Invalid token"});

    }

})


router.post("/session-login",async(req,res)=>{
    const {email,password} = req.body;

    const user = await prisma.user.findUnique({where:{email}});
    if(!user) return res.status(404).json({message:"User not found"});

    const isValid = await argon2.verify(user.password,password);
    if(!isValid) return res.status(400).json({message:"Invalid password"});

    req.session.userId = user.id;

    res.json({message:"Logged in via session"});
})

router.get("/session-profile",(req,res)=>{
    if(!req.session.userId) return res.status(401).json({message:"Not Authenticated"});

    res.json({
        message : "Session Login Success",
        userId : req.session.userId,
    })
})

router.post("/session-logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

export default router;