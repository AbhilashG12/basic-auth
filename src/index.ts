import express ,{type Request,type Response} from "express";
import mongoose from "mongoose";
import { authMiddleware } from "./middleware/authMiddleware.js";
import authRoutes from "./routes/auth.js"

const app = express();

app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
mongoose.connect(MONGO_URL).then(()=>{console.log("Database connected")}).catch((err)=>{console.log(err)})

app.use("/auth",authRoutes);

app.get("/profile",authMiddleware,(req:Request,res:Response)=>{
    res.json({message : "Protected data is accessed!!!"});
})

app.listen(8000,()=>{console.log("Server started")});
