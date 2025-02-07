import express from "express"
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controllers.js";
import { uploadSingle } from "../middlewares/multer.middlewares.js";

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar )
messageRouter.get('/:id', protectRoute, getMessages);
messageRouter.post('/send/:id', protectRoute, uploadSingle, sendMessage)


export default messageRouter;