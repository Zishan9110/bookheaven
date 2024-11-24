const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path to your User model
const router = express.Router();
const Book = require("../models/book");
const authenticateToken = require("./userAuth");

router.put("/add-to-cart", authenticateToken, async (req, res) => {
    try {
        const { bookid, id } = req.headers;
        
        // Validate that bookid and id are provided in the headers
        if (!bookid || !id) {
            return res.status(400).json({ message: "Book ID and User ID are required." });
        }

        const userData = await User.findById(id);

        // Check if the user exists
        if (!userData) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the book is already in the user's cart
        const isBookInCart = userData.cart.includes(bookid);  // Fixed cart to 'cart' (case-sensitive)
        if (isBookInCart) {
            return res.json({ status: "success", message: "Book is already in the cart." });
        }

        // Add the book to the cart
        await User.findByIdAndUpdate(id, { $push: { cart: bookid } });

        return res.json({ status: "success", message: "Book added to cart." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "An error occurred." });
    }
});

router.put("/remove-from-cart/:bookid", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; // Get user ID from the headers
        const { bookid } = req.params; // Get the book ID from the URL parameter

        // Validate inputs
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }
        if (!bookid) {
            return res.status(400).json({ message: "Book ID is required." });
        }

        // Validate IDs (assumes MongoDB ObjectId format)
        if (!id.match(/^[0-9a-fA-F]{24}$/) || !bookid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid User ID or Book ID format." });
        }

        // Remove the book directly from the cart
        const result = await User.findByIdAndUpdate(
            id,
            { $pull: { cart: bookid } }, // Remove the book ID from the carts array
            { new: true } // Return the updated document
        );

        // Check if the user exists
        if (!result) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the book was in the cart
        if (!result.cart.includes(bookid)) {
            return res.json({ status: "success", message: "Book was not in the cart." });
        }

        return res.json({ status: "success", message: "Book removed from cart.", updatedCart: result.cart });
    } catch (error) {
        console.error("Error in /remove-from-cart:", error);
        return res.status(500).json({ message: "An internal error occurred.", error: error.message });
    }
});


router.get("/get-user-cart", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers;

        // Validate that the user ID is provided
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Find the user and populate the cart field with book details
        const user = await User.findById(id).populate({
            path: "cart",
            model: "books", // Ensure this matches the collection name for books
        });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Handle empty or undefined cart
        if (!user.cart || user.cart.length === 0) {
            return res.status(200).json({
                message: "User cart is empty.",
                data: [],
            });
        }

        // Reverse the cart array to show the most recently added books first
        const reversedCart = user.cart.reverse();

        // Return the user's cart (populated with book details)
        return res.status(200).json({
            message: "User cart retrieved successfully.",
            data: reversedCart,
        });
    } catch (error) {
        console.error("Error fetching user cart:", error); // Log the error for debugging
        return res.status(500).json({ message: "Internal Server Error" });
    }
});










module.exports = router;
