const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Adjust the path to your User model
const Book = require("../models/book");
const Order = require("../models/order"); // Import the Order model
const authenticateToken = require("./userAuth");
const router = express.Router();

// order.js (Backend)
router.post("/place-order", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; // User ID from headers
        const { order } = req.body; // Order details from body

        // Validate the request data
        if (!id || !order || !Array.isArray(order)) {
            return res.status(400).json({ message: "Invalid request data." });
        }

        // Process each order item
        for (const orderData of order) {
            const newOrder = new Order({
                user: id,
                book: orderData._id, // Each item should have a book ID
            });
            const orderDataFromDb = await newOrder.save();

            // Add order to user's orders array
            await User.findByIdAndUpdate(id, { $push: { orders: orderDataFromDb._id } });

            // Remove the book from the user's cart (Important step)
            await User.findByIdAndUpdate(id, { $pull: { cart: orderData._id } }); // Ensure 'cart' matches User model
        }

        return res.json({
            status: "Success",
            message: "Order placed successfully.",
        });
    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(500).json({ message: "An error occurred while placing the order." });
    }
});



//get all history --admin
router.get("/get-order-history", authenticateToken, async (req, res) => {
    try {
        const { id } = req.headers; // Assuming the user ID is sent in headers

        // Validate user ID
        if (!id) {
            return res.status(400).json({ message: "User ID is required." });
        }

        // Fetch orders for the user and populate the book field
        const orders = await Order.find({ user: id })
            .populate({
                path: "book", // Populate the book details
                select: "title author price language desc url", // Select specific fields
            })
            .sort({ createdAt: -1 }); // Sort by newest orders first

        // Check if there are any orders
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this user." });
        }

        // Return the populated order history
        return res.status(200).json({
            status: "Success",
            message: "Order history retrieved successfully.",
            orders,
        });
    } catch (error) {
        console.error("Error fetching order history:", error); // Log the error
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
//get all orders --admin
// router.get("/get-all-orders", authenticateToken, async (req, res) => {
//     try {
//         console.log("User role:", req.user.role); // Debug user role
//         if (req.user.role !== "admin") {
//             return res.status(403).json({ message: "Access denied. Admins only." });
//         }

//         const orders = await Order.find({})
//             .populate("book", "title author price language desc url")
//             .populate("user", "username email address avatar")
//             .sort({ createdAt: -1 });

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found." });
//         }

//         return res.status(200).json({
//             status: "Success",
//             message: "All orders retrieved successfully.",
//             orders,
//         });
//     } catch (error) {
//         console.error("Error fetching all orders:", error.message); // Log error message
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });

router.get("/get-all-orders", authenticateToken, async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("book")
        .populate("user")
        .sort({ createdAt: -1 });
      res.status(200).json({ status: "Success", data: orders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "An error occurred." });
    }
  });


//updated order --admin
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["Order Placed", "Out for delivery", "Delivered", "Canceled"];

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(", ")}`
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({
      message: "Order status updated successfully.",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


module.exports = router;
