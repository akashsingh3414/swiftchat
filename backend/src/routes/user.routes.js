import express from 'express'
import { protectRoute } from '../middlewares/auth.middlewares.js'
import { uploadSingle } from '../middlewares/multer.middlewares.js'
import { connectUser, deleteProfile, removeConnection, updateProfile } from '../controllers/user.controllers.js'

const userRouter = express.Router()

userRouter.put('/update-profile', protectRoute, uploadSingle, updateProfile)
userRouter.get('/connect/:connectionCode', protectRoute, connectUser)
userRouter.patch('/remove-connection', protectRoute, removeConnection)
userRouter.delete('/delete', protectRoute, deleteProfile)

export default userRouter;