import express from 'express'
import { protectRoute } from '../middlewares/auth.middlewares.js'
import { uploadSingle } from '../middlewares/multer.middlewares.js'
import { deleteVideo, uploadVideo } from '../controllers/stream.controllers.js'

const streamRouter = express.Router()

streamRouter.post('/start-stream', protectRoute, uploadSingle, uploadVideo)
streamRouter.post('/leave-stream', protectRoute)
streamRouter.delete('/delete-stream', protectRoute, deleteVideo)

export default streamRouter;