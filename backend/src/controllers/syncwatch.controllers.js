import Space from "../models/space.models.js"
import User from "../models/user.models.js"

export const getWatchHistory = async (req, res) => {
    const userId = req.body.userId
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
        if(!user) {
            return res.status(404).json({message: "User not found. Invalid User Id"})
        }
        return res.status(200).json({essage: "User Watch History Fetched Successfully", watchHistory: user.watchHistory})
    } catch (error) {
        console.log('Error in getWatchHistory controller', error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addWatchHistory = async (req, res) => {
    const userId = req.body.userId
    const spaceId = req.body.spaceId
    const ytUrl = req.body.ytUrl

    try {
        if(spaceId) {
            const space = await Space.findById(spaceId)
            if(!space) {
                return res.status(400).json({message: "Invalid space id"})
            }

            //todo: get youtube video details from youtube api

            space.watchHistory.push({
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

        user.watchHistory.push({
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
    const userId = req.body.userId
    const spaceId = req.body.spaceId
    const ytUrl = req.body.ytUrl

    try {
        if(spaceId) {
            const space = await Space.findById(spaceId)
            if(!space) {
                return res.status(400).json({message: "Invalid space id"})
            }

            space.watchHistory = space.watchHistory.filter(history => history.url != ytUrl)

            await space.save()
            return res.status(200).json({message: "Successfully deleted"})
        }

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({message: "User not found. Invalid User Id"})
        }

        user.watchHistory = user.watchHistory.filter(history => history.url != ytUrl)

        await user.save()

        return res.status(200).json({message: "Successfully deleted"})
    } catch (error) {
        console.log('Error in deleteWatchHistory controller', error)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}