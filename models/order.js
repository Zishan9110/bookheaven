const mongoose = require("mongoose");

const order = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    book: {
        type: mongoose.Types.ObjectId,
        ref: "books",
        required: true
    },
    status: {
        type: String,
        enum: ["Order Placed", "Out For Delivery", "delivered", "cancelled"],
        default: "Order Placed"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", order);

module.exports = Order;
