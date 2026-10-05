const feedModel = require('../models/feed.model');
const userModel = require('../models/user.model');

// Fetch feed (Pagination: 20 posts at a time)
async function getFeed(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const posts = await feedModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({ posts });
    } catch (err) {
        return res.status(500).json({ message: "Failed to load feed", error: err.message });
    }
}

// Search users by username (Top search bar)
async function searchUser(req, res) {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ message: "Search query required" });

        const users = await userModel.find({ 
            userName: { $regex: query, $options: 'i' } 
        }).select('userName name profilePicture bio followers');

        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ message: "Search failed", error: err.message });
    }
}

module.exports = { getFeed, searchUser };