require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
    try {
        // Notice "campfire" added right before the ? 
        await mongoose.connect('mongodb+srv://divyanshacts29_db_user:Cyq3LTEEMuhS648X@cluster0.f1afhkr.mongodb.net/campfire?retryWrites=true&w=majority');
        console.log("Connected to Campfire DB");
    } catch (err) {
        console.log("Couldn't connect to DB", err);
    }
}

module.exports = connectDB;