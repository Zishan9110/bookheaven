const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
require("./conn/conn");

const User = require("./routes/user"); // Import user routes
const Books = require("./routes/book");
const Favourite = require("./routes/favourites");
const Cart = require("./routes/cart");
const Order = require("./routes/order");

app.use(cors());
app.use(express.json()); 
app.use("/api/v1", User); // Use User routes with the base path
app.use("/api/v1", Books);
app.use("/api/v1", Favourite);
app.use("/api/v1", Cart);
app.use("/api/v1", Order);



app.listen(process.env.PORT, () => {
    console.log(`Server Started on Port ${process.env.PORT}`);
});
