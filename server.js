// Ye chalane ke liye aapko terminal me likhna hoga: npm install express mongoose cors
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // JSON data accept karne ke liye

// Official standard connection string
const MONGO_URI = 'mongodb+srv://aadityak09771_db_user:aditya0987@cluster0.pkswoe4.mongodb.net/ironforge?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout sooner if no connection
  family: 4 // Force IPv4 (Bypasses Windows Node.js DNS bugs)
})
  .then(() => console.log("🔥 MongoDB Connected Successfully!"))
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err.message);
  });

// 1. User Database Schema banayein
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  startWt: Number,
  currentWt: Number,
  targetWt: Number,
  startDate: { type: Date, default: Date.now },
  weightHistory: [{ date: String, weight: Number }],
  progressData: { type: Object, default: {} } 
});

const User = mongoose.model('User', UserSchema);

// 2. API Routes Banayein

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Warrior Registered Successfully!", user: newUser });
  } catch (error) {
    res.status(400).json({ error: "Name already taken or bad request." });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name, password });
  if (user) {
    res.status(200).json({ message: "Login Successful", user });
  } else {
    res.status(401).json({ error: "Invalid Credentials" });
  }
});

// 3. Naye Data Endpoints (Weight, Sync, aur Leaderboard ke liye)

// Update Weight API
app.post('/api/update-weight', async (req, res) => {
  try {
    const { name, currentWt, weightHistory } = req.body;
    const user = await User.findOneAndUpdate({ name }, { currentWt, weightHistory }, { new: true });
    res.status(200).json({ message: "Weight updated", user });
  } catch(err) {
    res.status(400).json({ error: "Failed to update weight" });
  }
});

// Sync Progress API
app.post('/api/sync', async (req, res) => {
  try {
    const { name, progressData } = req.body;
    const user = await User.findOneAndUpdate({ name }, { progressData }, { new: true });
    res.status(200).json({ message: "Progress synced", user });
  } catch(err) {
    res.status(400).json({ error: "Failed to sync progress" });
  }
});

// Get All Users (Leaderboard) API
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name progressData');
    res.json(users);
  } catch(err) {
    res.status(400).json({ error: "Failed to fetch users" });
  }
});

// Server chalu karein
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Vercel Serverless Function export
module.exports = app;