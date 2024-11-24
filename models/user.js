const mongoose = require("mongoose");

const user = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/9187/9187604.png",
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
    },
    favourites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
    }],
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "books",
    }],

    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    }]
} , {timestamps: true});

const User = mongoose.model("User", user);

module.exports = User;
