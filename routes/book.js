const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path to your User model
const router = express.Router();
const Book = require("../models/book");
const authenticateToken = require("./userAuth");

// Add a new book
router.post("/add-book", authenticateToken, async (req, res) => {

    console.log("Add book route hit!");
    console.log("Request Body:", req.body);
    console.log("Request Headers:", req.headers);
    console.log("Received add-book request:", req.body);
    try {
        const { id } = req.headers;
        console.log("Admin ID:", id);
        const user = await User.findById(id);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "You do not have admin access." });
        }
        const book = new Book(req.body);
        await book.save();
        res.status(200).json({ message: "Book added successfully!" });
    } catch (error) {
        console.error("Error in add-book route:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
});


// Update an existing book
router.put("/update-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;

        // Validate headers
        if (!bookid) {
            return res.status(400).json({ message: "Book ID is required in headers." });
        }

        // Update the book
        const updatedBook = await Book.findByIdAndUpdate(
            bookid,
            {
                url: req.body.url,
                title: req.body.title,
                author: req.body.author,
                price: req.body.price,
                desc: req.body.desc,
                language: req.body.language,
            },
            { new: true, runValidators: true } // Return updated document and validate inputs
        );

        // Check if the book exists
        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found." });
        }

        return res.status(200).json({ message: "Book updated successfully.", book: updatedBook });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ message: "An error occurred while updating the book." });
    }
});

//delete book
router.delete("/delete-book", authenticateToken, async (req, res) => {
    try {
        const { bookid } = req.headers;

        // Check if `bookid` is provided
        if (!bookid) {
            return res.status(400).json({ message: "Book ID is required." });
        }

        // Find and delete the book
        const deletedBook = await Book.findByIdAndDelete(bookid);

        // Check if the book exists
        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found." });
        }

        return res.status(200).json({ message: "Book deleted successfully." });
    } catch (error) {
        console.error("Error deleting book:", error);
        return res.status(500).json({ message: "An error occurred." });
    }
});

// Get all books
router.get("/get-all-books", async (req, res) => {
    try {
        const books = await Book.find(); // Retrieve all books from the database
        if (books.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }
        res.status(200).json({ message: "Books retrieved successfully.", books });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


// Get 4 most recent books
router.get("/get-recent-books", async (req, res) => {
    try {
        const recentBooks = await Book.find()
            .sort({ _id: -1 }) // Sort by creation date (newest first)
            .limit(4); // Limit to 4 books

        if (recentBooks.length === 0) {
            return res.status(404).json({ message: "No books found." });
        }

        res.status(200).json({ message: "Recent books retrieved successfully.", books: recentBooks });
    } catch (error) {
        console.error("Error fetching recent books:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Get a book by ID (Public route)
router.get("/get-book-by-id/:id", async (req, res) => {
    try {
        const bookId = req.params.id;

        // Validate the ID and find the book
        const book = await Book.findById(bookId);

        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        res.status(200).json({ message: "Book retrieved successfully.", book });
    } catch (error) {
        console.error("Error retrieving book by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


module.exports = router;
