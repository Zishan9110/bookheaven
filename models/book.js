const mongoose = require("mongoose");

const book = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Books = mongoose.model("books", book); // Changed to lowercase "books"

module.exports = Books;
