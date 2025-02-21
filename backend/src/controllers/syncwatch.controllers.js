import Space from "../models/space.models.js"
import User from "../models/user.models.js"

export const getWatchHistory = async (req, res) => {
    const userId = req.user.id
    const targetUserId = req.body.userId
    const spaceId = req.body.spaceId

    try {
        if(spaceId) {
            const space = await Space.findById(spaceId)
            if(!space) {
                return res.status(400).json({message: "Invalid space id"})
            }

            return res.status(201).json({message: "Space Watch History Fetched Successfully", watchHistory: space.watchHistory})
        }

        const user = await User.findById(userId)
        const targetUser = await User.findById(targetUserId)

        if(!user || !targetUser) {
            return res.status(400).json({message: "Invalid user id"})
        }

        const watchHistory = user.watchHistory

        if(!user) {
            return res.status(404).json({message: "User not found. Invalid User Id"})
        }

        return res.status(200).json({message: "User Watch History Fetched Successfully", watchHistory})
    } catch (error) {
        console.log('Error in getWatchHistory controller', error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addWatchHistory = async (req, res) => {
    const userId = req.user.id
    const spaceId = req.body.spaceId
    const targetUserId = req.body.userId
    const ytUrl = req.body.ytUrl

    try {
        if(spaceId) {
            const space = await Space.findById(spaceId)
            if(!space) {
                return res.status(400).json({message: "Invalid space id"})
            }

            //todo: get youtube video details from youtube api

            space.watchHistory.push({
                host: userId,
                title: 'Title - Unavailable',
                url: ytUrl
            })

            await space.save()
            return res.status(201).json({watchHistory: space.watchHistory})
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({message: "User not found. Invalid User Id"})
        }

        //todo: get youtube video details from youtube api
        //signal other user about new video
        //add into other's history only when other user joins the stream else update only one user

        user.watchHistory.push({
            host: userId,
            viewer: targetUserId,
            title: 'Title - Unavailable',
            url: ytUrl
        })

        await user.save()

        return res.status(201).json({watchHistory: user.watchHistory})
    } catch (error) {
        console.log('Error in addWatchHistory controller', error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const deleteWatchHistory = async (req, res) => {
    const userId = req.user.id
    const spaceId = req.body.spaceId
    const ytUrlId = req.body.ytUrlId

    try {
        if(spaceId) {
            const space = await Space.findById(spaceId)
            if(!space) {
                return res.status(400).json({message: "Invalid space id"})
            }

            if(userId !== space.creator.toString()) {
                return res.status(403).json({message: "Action not allowed to non-admins"})
            }

            space.watchHistory = space.watchHistory.filter(history => history._id != ytUrlId)

            await space.save()
            return res.status(200).json({message: "Successfully deleted"})
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({message: "User not found. Invalid User Id"})
        }

        user.watchHistory = user.watchHistory.filter(history => history._id != ytUrlId)

        await user.save()

        return res.status(200).json({message: "Successfully deleted"})
    } catch (error) {
        console.log('Error in deleteWatchHistory controller', error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}