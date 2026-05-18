
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();

const corsOptions = {
    origin: [
        "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};


app.all("/api/auth/*", toNodeHandler(auth));

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
});