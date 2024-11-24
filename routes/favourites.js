const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // Add this import
const User = require("../models/user"); // Adjust the path to your User model
const router = express.Router();
const Book = require("../models/book");
const authenticateToken = require("./userAuth");

// Add book to favourites route
router.put("/add-book-to-favourite", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;

        if (!bookid || !id) {
            return res.status(400).json({ message: "Book ID and User ID are required." });
        }

        const userData = await User.findById(id);

        if (!userData) {
            return res.status(404).json({ message: "User not found." });
        }

        if (userData.favourites.includes(bookid)) {
            return res.status(200).json({ message: "Book is already in favourites." });
        }

        await User.findByIdAndUpdate(id, { $push: { favourites: bookid } });

        return res.status(200).json({ message: "Book added to favourites." });
    } catch (error) {
        console.error("Error adding book to favourites:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Remove book from favourites route
router.put("/remove-book-from-favourite", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;
        const { bookid } = req.body;

        if (!bookid || !id) {
            return res.status(400).json({ message: "Book ID and User ID are required." });
        }

        if (!mongoose.Types.ObjectId.isValid(bookid)) {
            return res.status(400).json({ message: "Invalid book ID." });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        const userData = await User.findById(id);

        if (!userData) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!userData.favourites.includes(bookid)) {
            return res.status(404).json({ message: "Book is not in favourites." });
        }

        await User.findByIdAndUpdate(id, { $pull: { favourites: bookid } });

        return res.status(200).json({ message: "Book removed from favourites." });
    } catch (error) {
        console.error("Error removing book from favourites:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});





router.get("/get-favourite-books", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        // Validate user ID
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find user and populate the favourites field
        const user = await User.findById(id).populate({
            path: "favourites",
            model: "books", // Changed to lowercase "books"
        });

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Return the populated favourites
        return res.status(200).json({
            message: "Favourite books retrieved successfully.",
            favourites: user.favourites,
        });
    } catch (error) {
        console.error("Error fetching favourite books:", error); // Log the error for debugging
        return res.status(500).json({ message: "Internal Server Error" });
    }
});








module.exports = router;