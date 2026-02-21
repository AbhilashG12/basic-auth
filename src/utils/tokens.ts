import jwt , {type SignOptions} from "jsonwebtoken";
import prisma from "../prisma.js";
import "dotenv/config";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES!;
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES!;

export function generateAccess(userId: number): string {
    const options: SignOptions = {
        expiresIn: ACCESS_EXPIRES as any as SignOptions["expiresIn"]
    }

    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, options);
}

export function generateRefresh(userId:number){
    const options : SignOptions = {
        expiresIn : REFRESH_EXPIRES as any as SignOptions["expiresIn"]
    }
    return jwt.sign({userId},REFRESH_TOKEN_SECRET,options)
}

export async function storeRefresh(userId:number,token:string){
    await prisma.refreshToken.create({
        data : {
            token,
            userId,
            expiresAt : new Date(Date.now()+7*24*60*60*1000)
        }
    })
}

export async function revokeRefresh(token:string){
    await prisma.refreshToken.updateMany({
        where : {token},
        data : {revoked : true}
    })
}