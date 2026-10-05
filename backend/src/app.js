const express = require('express');
const cors = require('cors');
const connectDB = require('./lib/db');

// ROUTE IMPORTS
const authRoutes = require('./routes/auth.routes');
const discoverRoutes = require('./routes/discover.routes');
const userProfileRoutes = require('./routes/userProfile.routes');
const messageRoutes = require('./routes/message.routes'); // Matches your route filename
const globalRoutes = require('./routes/global.routes');

const app = express();

// MIDDLEWARES
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/discoverPage", discoverRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/global", globalRoutes);

// CONNECT TO MONGO DB
connectDB();

// BASE HEALTH CHECK API
app.get("/", (req, res) => {
    res.send("Campfire Backend API is running smoothly...");
});

module.exports = app;