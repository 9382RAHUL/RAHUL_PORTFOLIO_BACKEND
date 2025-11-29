const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/portfolioDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const ContactSchema = new mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);

// API to save data
app.post("/contact", async (req, res) => {
    const data = new Contact(req.body);
    await data.save();
    res.json({ message: "Message saved successfully!" });
});

app.get("/contact", (req, res) => {
  res.send("Contact API working. Use POST to submit data.");
});

app.listen(5000, () => console.log("Server running on port 5000"));
