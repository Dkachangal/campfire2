const messageModel = require('../models/message.model');
const userModel = require('../models/user.model');

// Fetch the list of followers & following to populate the DM tab
async function getAvailableChats(req, res) {
    try {
        const { userName } = req.params;
        const user = await userModel.findOne({ userName });
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Combine followers and following into a unique list
        const networkUsernames = [...new Set([...user.followers, ...user.following])];
        
        const chatCandidates = await userModel.find({
            userName: { $in: networkUsernames }
        }).select('userName name profilePicture');

        return res.status(200).json({ chatCandidates });
    } catch (err) {
        return res.status(500).json({ message: "Failed to load chats", error: err.message });
    }
}

// Fetch chat history for a specific room
async function getChatHistory(req, res) {
    try {
        const { roomId } = req.params;
        
        // Retrieve all messages for the room[cite: 13] and sort oldest to newest
        const history = await messageModel.find({ roomId }).sort({ createdAt: 1 });
        
        return res.status(200).json({ history });
    } catch (err) {
        return res.status(500).json({ message: "Failed to load history", error: err.message });
    }
}

module.exports = { getAvailableChats, getChatHistory };