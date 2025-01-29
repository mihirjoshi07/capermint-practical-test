const jwt = require("jsonwebtoken");
const User = require("../models/User");
const register = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      // Create the new user if the username is unique
      const newUser = await User.create({ username, password });
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, username:username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
