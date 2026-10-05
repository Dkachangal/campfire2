// THIS FILE HOLDS THE USER SCHEMA AND USER MODEL

require('dotenv').config();
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        default: "",
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    password: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: "",
    },
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
    },
    followers: {
        // USED TO STORE THE USERNAME OF followers
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: []
    },
    name: {
        type: String,
        default: ""
    },
    dms: {
        type: [String],
        default: []
    },
    matchingTime: {
        type: Map,     // THIS STORES {matchedUser's userName : avg time matched in seconds (in random vid call) }
        of: Number,
        default: {}
    },
    hobbies: { 
        type: [String], 
        default: [] 
    }
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;