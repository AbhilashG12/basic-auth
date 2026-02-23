import { type Request,type Response,type NextFunction } from "express";

export function requireRole(...allowedRoles:string[]){
    return (req:any,res:Response,next:NextFunction)=>{
        if(!req.user) return res.status(401).json({message:"Not Authenticated"});
        const userRole = req.user.role;

        if(!allowedRoles.includes(userRole)) return res.status(403).json({message:"Forbidden:Insufficient role"});
        next();
    }
}