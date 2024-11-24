const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path to your User model
const router = express.Router();
const authenticateToken = require("./userAuth");

// Sign-up route
router.post("/sign-up", async (req, res) => {
    const { username, email, password, address } = req.body;

    // Validate username length
    if (!username || username.length < 4) {
        return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    // Validate password length
    if (!password || password.length < 5) {
        return res.status(400).json({ message: "Password must be at least 5 characters long." });
    }

    try {
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            address,
        });

        // Save the user in the database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "An error occurred during registration." });
    }
});

// Sign-in route
router.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Ensure all relevant fields are selected, including `role`
        const user = await User.findOne({ email }).select("username email role password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, "bookStore123", { expiresIn: "45min" });

        // Log the user data to verify
        console.log("User data before response:", user);

        // Send response including the `role` field
        res.status(200).json({
            message: "Sign-in successful.",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role, // Ensure role is added here
            },
            token,
        });
    } catch (error) {
        console.error("Error during sign-in:", error);
        res.status(500).json({ message: "An error occurred during sign-in." });
    }
});



// Get user information
router.get("/get-user-information", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id; // Use the id from the decoded token
        const user = await User.findById(userId).select("-password"); // Exclude password from the response
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user information:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Update address route
router.put("/update-address", authenticateToken, async (req, res) => {
    const { address } = req.body;

    // Validate that address is provided
    if (!address || address.trim().length === 0) {
        return res.status(400).json({ message: "Address is required." });
    }

    try {
        const userId = req.user.id; // Get user ID from token

        // Find the user and update their address
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { address },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "Address updated successfully.",
            user: { id: updatedUser._id, username: updatedUser.username, address: updatedUser.address },
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Update address route
router.put("/update-address", authenticateToken, async (req, res) => {
    const { address } = req.body;

    // Validate that address is provided
    if (!address || address.trim().length === 0) {
        return res.status(400).json({ message: "Address is required." });
    }

    try {
        const userId = req.user.id; // Get user ID from token

        // Find the user and update their address
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { address },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({
            message: "Address updated successfully.",
            user: { id: updatedUser._id, username: updatedUser.username, address: updatedUser.address },
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

  
module.exports = router;
