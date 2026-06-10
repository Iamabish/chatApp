
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import initSocket from "./lib/socket.js";
import { createServer } from "http"
import messageRoute from './routes/messgeRoute.js'
import userRoute from './routes/userRoute.js'
import roomRoute from './routes/roomRoute.js'

export const app = express();

const corsOptions = {
    origin: [
        "https://chatup-gfmk.onrender.com",
        "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
};


app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.all("/api/auth/*path", toNodeHandler(auth));

console.log('server hit ');


app.use('/api/message', messageRoute)
app.use('/api/user', userRoute)
app.use('/api/room', roomRoute)



const server = createServer(app)

initSocket(server)


app.get("/api/", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running"
  })
})


server.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
});