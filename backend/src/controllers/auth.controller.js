const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Step 1 of Signup: Check if email is unique
async function checkEmail(req, res) {
    try {
        const { email } = req.body;
        const userExists = await userModel.findOne({ email });
        
        if (userExists) {
            return res.status(409).json({ message: "Email already in use." });
        }
        return res.status(200).json({ message: "Email is unique, proceed to hobbies." });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

// Final Step of Signup: Create Account
async function registerUser(req, res) {
    try {
        const { email, password, userName, name, bio, profilePicture, hobbies } = req.body;

        const userExists = await userModel.findOne({ $or: [{ email }, { userName }] });
        if (userExists) return res.status(409).json({ message: "Email or Username already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            email,
            password: hashedPassword,
            userName,
            name,
            bio,
            profilePicture,
            hobbies 
        });

        const token = jwt.sign({ id: newUser._id, userName: newUser.userName }, process.env.JWT_SECRET || 'secret');
        return res.status(201).json({ message: "Account created successfully", token, userName });
    } catch (err) {
        return res.status(500).json({ message: "Registration error", error: err.message });
    }
}

// Login
async function loginUser(req, res) {``
    console.log("AA GAYA !");
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found." });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: "Wrong password." });

        const token = jwt.sign({ id: user._id, userName: user.userName }, process.env.JWT_SECRET || 'secret');
        return res.status(200).json({ message: "Login successful", token, userName: user.userName });
    } catch (err) {
        return res.status(500).json({ message: "Login failed", error: err.message });
    }
}

module.exports = { checkEmail, registerUser, loginUser };