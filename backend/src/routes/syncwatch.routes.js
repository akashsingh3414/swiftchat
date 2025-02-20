import { Router } from "express"
import { protectRoute } from "../middlewares/auth.middlewares.js"
import { addWatchHistory, deleteWatchHistory, getWatchHistory } from "../controllers/syncwatch.controllers.js"

const syncWatchRouter = Router();

syncWatchRouter.post('/get', protectRoute, getWatchHistory)
syncWatchRouter.post('/add', protectRoute, addWatchHistory)
syncWatchRouter.delete('/delete', protectRoute, deleteWatchHistory)

export default syncWatchRouter