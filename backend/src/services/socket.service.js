const { Server } = require('socket.io');
const messageModel = require('../models/message.model');
const userModel = require('../models/user.model');

// SURGE STATE
let surgeQueue = []; // Users waiting for a match
const activeSurgeRooms = new Map(); // roomId -> { users: [socketId1, socketId2] }

function initializeServer(server) {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // MATCHMAKING ALGORITHM
    const matchUsers = () => {
        if (surgeQueue.length < 2) {
            // Notify the lone user if they are the only one alive
            if (surgeQueue.length === 1) {
                io.to(surgeQueue[0].socket.id).emit('surge_status', 'Only you are alive right now...');
            }
            return;
        }

        // Find two users who haven't just skipped each other
        for (let i = 0; i < surgeQueue.length; i++) {
            for (let j = i + 1; j < surgeQueue.length; j++) {
                const user1 = surgeQueue[i];
                const user2 = surgeQueue[j];

                if (!user1.skipped.has(user2.userName) && !user2.skipped.has(user1.userName)) {
                    // Match found! Remove them from queue
                    surgeQueue.splice(j, 1);
                    surgeQueue.splice(i, 1);

                    const roomId = `surge_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                    
                    user1.socket.join(roomId);
                    user2.socket.join(roomId);
                    activeSurgeRooms.set(roomId, { users: [user1, user2] });

                    // Tell them to start WebRTC (User 1 is the Caller)
                    user1.socket.emit('surge_match', { roomId, isCaller: true, partnerName: user2.userName });
                    user2.socket.emit('surge_match', { roomId, isCaller: false, partnerName: user1.userName });

                    // Check if anyone else is waiting
                    matchUsers(); 
                    return;
                }
            }
        }
    };

    io.on("connection", (socket) => {

        // ==========================================
        // 1. EXISTING PERSONAL DM CHAT LOGIC
        // ==========================================
        socket.on("join_chat", (data) => {
            socket.join(data.roomId);
        });

        socket.on("msg_to_server", async (data) => {
            const { roomId, senderUserName, receiverUserName, text } = data;
            io.to(roomId).emit("msg_from_server", { message: text, senderUserName, roomId });

            await messageModel.create({ roomId, senderUserName, receiverUserName, text });
            try {
                await Promise.all([
                    userModel.findOneAndUpdate({ userName: senderUserName }, { $inc: { aura: -2 } }),
                    userModel.findOneAndUpdate({ userName: receiverUserName }, { $inc: { aura: 10 } })
                ]);
            } catch (err) {
                console.log("DB operation failed:", err);
            }
        });

        // ==========================================
        // 2. NEW SURGE WEBRTC LOGIC
        // ==========================================
        
        socket.on("surge_join", ({ userName }) => {
            // Prevent double joining
            if (!surgeQueue.find(u => u.socket.id === socket.id)) {
                surgeQueue.push({ socket, userName, skipped: new Set() });
                matchUsers();
            }
        });

        socket.on("surge_offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("surge_offer", offer);
        });

        socket.on("surge_answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("surge_answer", answer);
        });

        socket.on("surge_ice_candidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("surge_ice_candidate", candidate);
        });

        const handleSurgeLeave = (isNext) => {
            let userRoomId = null;
            let roomData = null;

            // Find if user is in an active call
            for (const [rId, data] of activeSurgeRooms.entries()) {
                if (data.users.find(u => u.socket.id === socket.id)) {
                    userRoomId = rId;
                    roomData = data;
                    break;
                }
            }

            if (userRoomId && roomData) {
                const me = roomData.users.find(u => u.socket.id === socket.id);
                const partner = roomData.users.find(u => u.socket.id !== socket.id);

                // Destroy the room
                activeSurgeRooms.delete(userRoomId);
                me.socket.leave(userRoomId);
                partner.socket.leave(userRoomId);

                // Notify partner the call ended
                partner.socket.emit("surge_peer_left");

                if (isNext) {
                    // Add each other to skip lists so they don't instantly rematch
                    me.skipped.add(partner.userName);
                    partner.skipped.add(me.userName);
                    
                    // Put both back in queue
                    surgeQueue.push(me);
                    surgeQueue.push(partner);
                    matchUsers();
                } else {
                    // Only put partner back in queue (current user is leaving the tab)
                    partner.skipped.clear(); // Clear their skips so they can match fresh
                    surgeQueue.push(partner);
                    matchUsers();
                }
            } else {
                // If they were just in queue, remove them
                surgeQueue = surgeQueue.filter(u => u.socket.id !== socket.id);
            }
        };

        socket.on("surge_next", () => handleSurgeLeave(true));
        socket.on("surge_leave", () => handleSurgeLeave(false));

        socket.on("disconnect", () => {
            handleSurgeLeave(false);
        });
    });
}

module.exports = { initializeServer };