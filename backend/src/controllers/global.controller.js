const feedModel = require('../models/feed.model');

// Create a post (text[0] is caption, text[1+] are images)[cite: 12]
async function createPost(req, res) {
    try {
        const { author, text } = req.body;
        
        if (!text || text.length === 0) {
            return res.status(400).json({ message: "Post must contain text/content." });
        }

        const newPost = await feedModel.create({ author, text });
        return res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create post", error: err.message });
    }
}

// Like, Repost, and Share Handlers
async function interactWithPost(req, res) {
    try {
        const { postId, action, userName } = req.body; // action: 'like', 'repost', or 'share'
        let updateQuery = {};

        if (action === 'like') updateQuery = { $inc: { likes: 1 } };
        if (action === 'share') updateQuery = { $inc: { shares: 1 } };
        if (action === 'repost') updateQuery = { $addToSet: { reposts: userName } }; // Prevents duplicate reposts

        const updatedPost = await feedModel.findByIdAndUpdate(postId, updateQuery, { new: true });
        return res.status(200).json({ message: `Post ${action}d successfully`, post: updatedPost });
    } catch (err) {
        return res.status(500).json({ message: "Interaction failed", error: err.message });
    }
}

// Comment on a post (using Map of [String])[cite: 12]
async function commentOnPost(req, res) {
    try {
        const { postId, userName, comment } = req.body;
        
        const post = await feedModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // Retrieve existing comments for this user, add the new one, and update the Map
        const userComments = post.comments.get(userName) || [];
        userComments.push(comment);
        post.comments.set(userName, userComments);
        
        await post.save();
        return res.status(200).json({ message: "Comment added", post });
    } catch (err) {
        return res.status(500).json({ message: "Failed to comment", error: err.message });
    }
}

module.exports = { createPost, interactWithPost, commentOnPost };