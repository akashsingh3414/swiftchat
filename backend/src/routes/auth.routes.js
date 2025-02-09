import express from 'express'
import { checkAuth, login, logout, signup } from '../controllers/auth.controllers.js';
import { protectRoute } from '../middlewares/auth.middlewares.js';

const authRouter = express.Router();

authRouter.post('/signup', signup)
authRouter.post('/login', login)
authRouter.get('/logout', logout)
authRouter.get("/check", protectRoute, checkAuth);

export default authRouter;

