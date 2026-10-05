const userModel = require('../models/user.model');
const feedModel = require('../models/feed.model');

// Get User Profile + Their Posts
async function getProfile(req, res) {
    try {
        const { userName } = req.params;
        
        const user = await userModel.findOne({ userName }).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Fetch posts created by the user OR reposted by the user
        const posts = await feedModel.find({ 
            $or: [{ author: userName }, { reposts: userName }] 
        }).sort({ createdAt: -1 });

        return res.status(200).json({ user, posts });
    } catch (err) {
        return res.status(500).json({ message: "Failed to load profile", error: err.message });
    }
}

// Follow / Unfollow logic
async function toggleFollow(req, res) {
    try {
        const { currentUserName, targetUserName } = req.body;

        const targetUser = await userModel.findOne({ userName: targetUserName });
        const currentUser = await userModel.findOne({ userName: currentUserName });

        if (!targetUser || !currentUser) return res.status(404).json({ message: "User not found" });

        const isFollowing = currentUser.following.includes(targetUserName);

        if (isFollowing) {
            // Unfollow
            await userModel.findOneAndUpdate({ userName: currentUserName }, { $pull: { following: targetUserName } });
            await userModel.findOneAndUpdate({ userName: targetUserName }, { $pull: { followers: currentUserName } });
            return res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            // Follow
            await userModel.findOneAndUpdate({ userName: currentUserName }, { $addToSet: { following: targetUserName } });
            await userModel.findOneAndUpdate({ userName: targetUserName }, { $addToSet: { followers: currentUserName } });
            return res.status(200).json({ message: "Followed successfully" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Action failed", error: err.message });
    }
}

module.exports = { getProfile, toggleFollow };