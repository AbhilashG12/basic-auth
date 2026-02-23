import "dotenv/config";
import jwt, { type SignOptions } from "jsonwebtoken";
import prisma from "../prisma.js";


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "default_access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";

export function generateAccess(userId: number,role:string): string {
    const options: SignOptions = {

        expiresIn: ACCESS_EXPIRES as any as SignOptions["expiresIn"]
    };

    return jwt.sign({ userId,role }, ACCESS_TOKEN_SECRET, options);
}

export function generateRefresh(userId: number): string {
    const options: SignOptions = {
        expiresIn: REFRESH_EXPIRES as any as SignOptions["expiresIn"]
    };
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, options);
}

export async function storeRefresh(userId: number, token: string) {

    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    });
}

export async function revokeRefresh(token: string) {
    await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true }
    });
}