import { type Request,type Response,type NextFunction } from "express";
import jwt from "jsonwebtoken";
import {type MyToken} from "./authMiddleware.js"

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
    userId? : string;
}


export const authMiddleware=(req:AuthRequest,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader) return res.status(401).json({message : "No token is provided"});

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token as string,JWT_SECRET)as unknown as MyToken
        req.userId = decoded.userId;
        next();

    }catch(err){
        res.status(401).json({message:"Invalid token"});
        
    }
}


