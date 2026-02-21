import express from "express";
import authRoutes from "./routes/prismaAuth.js";
import {authMiddleware} from "./middleware/prismaMiddleware.js"
import "dotenv/config";

const app = express();

app.use(express.json());
app.use("/auth",authRoutes);

app.get("/protected",authMiddleware,(req,res)=>{
    res.json({message:"Protected data is accessed"});
})
app.listen(8000,()=>{console.log("Server started")});