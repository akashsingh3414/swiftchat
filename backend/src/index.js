import express from 'express'
import authRouter from './routes/auth.routes.js'
import dotenv from 'dotenv'
import { connectDB } from './lib/db.js'
import cookieParser from 'cookie-parser'
import messageRouter from './routes/message.routes.js'
import cors from 'cors'
import { app, server } from './lib/socket.js'
import userRouter from './routes/user.routes.js'
import spaceRouter from './routes/space.routes.js'
import { ExpressPeerServer } from 'peer'
import streamRouter from './routes/stream.routes.js'
import path from 'path'

dotenv.config()

const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRouter)
app.use('/api/message', messageRouter)
app.use('/api/user', userRouter)
app.use('/api/space', spaceRouter)
app.use('/peerjs', peerServer);
app.use('/api/stream', streamRouter);

const PORT = process.env.PORT || 5001

const __dirname = path.resolve();

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res)=>{
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

server.listen(PORT, () => {
    console.log('Server is running at port: ', PORT)
    connectDB()
})