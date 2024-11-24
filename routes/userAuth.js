const jwt = require("jsonwebtoken");

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;


        // Check if token is missing
        if (!token) {
            return res.status(401).json({ message: "Authentication token is required." });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET || "bookStore123", (err, user) => {
            if (err) {
                console.error("Token verification error:", err.message); // Log for debugging
                return res.status(403).json({ message: "Token expired or invalid. Please sign in again." });
            }

            req.user = user; // Attach user data to request
            next(); // Proceed to next middleware or route handler
        });
    } catch (error) {
        console.error("Authentication error:", error.message); // Log unexpected errors
        return res.status(500).json({ message: "An internal error occurred during authentication." });
    }
};

module.exports = authenticateToken;
