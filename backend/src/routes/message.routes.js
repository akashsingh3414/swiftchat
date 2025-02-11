import express from "express"
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { deleteUserMessages, getMessagesForUser, getUsersForSidebar, sendMessage } from "../controllers/message.controllers.js";
import { uploadSingle } from "../middlewares/multer.middlewares.js";

const messageRouter = express.Router();

messageRouter.get('/users', protectRoute, getUsersForSidebar )
messageRouter.get('/:id', protectRoute, getMessagesForUser);
messageRouter.post('/send/:receiverId', protectRoute, uploadSingle, sendMessage)
messageRouter.post('/delete', protectRoute, deleteUserMessages)

export default messageRouter;