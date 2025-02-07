import express from 'express'
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controllers.js';
import { protectRoute } from '../middlewares/auth.middlewares.js';
import { uploadSingle } from '../middlewares/multer.middlewares.js'

const authRouter = express.Router();

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.put('/update-profile', protectRoute, uploadSingle, updateProfile)
authRouter.get("/check", protectRoute, checkAuth);

export default authRouter;

