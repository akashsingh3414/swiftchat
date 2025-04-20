import express from 'express'
import { protectRoute } from '../middlewares/auth.middlewares.js'
import { uploadSingle } from '../middlewares/multer.middlewares.js'
import { deleteStream, deleteVideo, getStreams, uploadVideo } from '../controllers/stream.controllers.js'

const streamRouter = express.Router()

streamRouter.post('/start-stream', protectRoute, uploadSingle, uploadVideo)
streamRouter.post('/leave-stream', protectRoute)
streamRouter.delete('/delete-stream', protectRoute, deleteVideo)
streamRouter.get('/get-stream', protectRoute, getStreams)
streamRouter.delete('/delete-stream-record/:streamId', protectRoute, deleteStream)

export default streamRouter;