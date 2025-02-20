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
import syncWatchRouter from './routes/syncwatch.routes.js'

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
app.use('/api/sync-watch', syncWatchRouter)
app.use('/peerjs', peerServer);

const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
    console.log('Server is running at port: ', PORT)
    connectDB()
})