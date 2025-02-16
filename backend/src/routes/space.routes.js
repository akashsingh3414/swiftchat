import express from 'express'
import { protectRoute } from '../middlewares/auth.middlewares.js';
import { connectToSpace, createSpace, deleteSpace, getMembersForSpace, getMessagesForSpace, getSpacesForSidebar, leaveSpace, modifyInvite, spaceWatchHistory } from '../controllers/space.controllers.js';
import { deleteAllMessages } from '../controllers/message.controllers.js';

const spaceRouter = express.Router();

spaceRouter.post('/create', protectRoute, createSpace)
spaceRouter.get('/connect/:spaceCode', protectRoute, connectToSpace)
spaceRouter.get('/message/:spaceId', protectRoute, getMessagesForSpace)
spaceRouter.patch('/leave', protectRoute, leaveSpace)
spaceRouter.delete('/delete', protectRoute, deleteSpace)
spaceRouter.get('/spaces', protectRoute, getSpacesForSidebar)
spaceRouter.delete('/message/delete-all', protectRoute, deleteAllMessages)
spaceRouter.post('/modify-invite', protectRoute, modifyInvite)
spaceRouter.get('/getMembers/:spaceId', protectRoute, getMembersForSpace)
spaceRouter.post('/watch-history', protectRoute, spaceWatchHistory)

export default spaceRouter