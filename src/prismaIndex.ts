import "dotenv/config";
import express from "express";
import authRoutes from "./routes/prismaAuth.js";
import {authMiddleware} from "./middleware/prismaMiddleware.js"
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import prisma from "./prisma.js";


const app = express();

app.use(express.json());

app.use(
    session({
        secret : "mysessionsect",
        resave : false,
        saveUninitialized : false,
        cookie : {
            httpOnly : true,
            maxAge : 7 * 24 * 60 * 60 * 1000,
            secure : false,
        },
        store : new PrismaSessionStore(prisma,{
            checkPeriod : 2 * 60 * 1000,
            dbRecordIdIsSessionId : false,
            dbRecordIdFunction : undefined,
        })
    }),
)

app.use("/auth",authRoutes);

app.get("/protected",authMiddleware,(req,res)=>{
    res.json({message:"Protected data is accessed"});
})
app.listen(8000,()=>{console.log("Server started")});