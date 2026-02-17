import {type Request,type Response,type NextFunction} from "express";
import jwt , {type JwtPayload} from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mysecret";

export interface AuthReq extends Request {
    userId? : string,
}

interface MyToken extends JwtPayload {
  userId: string;
}

export const authMiddleware = (
    req : AuthReq,
    res : Response,
    next : NextFunction,

)=>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ") || !JWT_SECRET) {
        return res.status(401).json({ message: "No token provided or server misconfigured" });
    }

    const token = authHeader.split(" ")[1];
    try{
        const decoded = jwt.verify(token as string,JWT_SECRET) as unknown as MyToken;
        req.userId = decoded.userId
        next();

    }catch{
        res.status(401).json({message:"Invalid Token"})
    }
}