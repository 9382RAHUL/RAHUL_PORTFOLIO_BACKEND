// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(cors({
//   origin: ["https://your-frontend.vercel.app", "https://vercel.app"] // or use "*" for quick test
// }));
// // app.use(express.json());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect("mongodb+srv://rahulmodak:portfolio@cluster0.kmbsxiz.mongodb.net/?appName=Cluster0")
// .then(() => console.log("MongoDB Connected"))
// .catch(err => console.log(err));

// // Schema
// const ContactSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     subject: String,
//     message: String,
//     date: { type: Date, default: Date.now }
// });

// const Contact = mongoose.model("Contact", ContactSchema);

// // API to save data
// app.post("/contact", async (req, res) => {
//     const data = new Contact(req.body);
//     await data.save();
//     res.json({ message: "Message saved successfully!" });
// });

// app.get("/contact", (req, res) => {
//   res.send("Contact API working. Use POST to submit data.");
// });

// app.listen(5000, () => console.log("Server running on port 5000"));



// require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// simple health route
app.get("/api/health", (req, res) => res.json({ ok: true }));

const start = async () => {
  const MONGO_URI = "mongodb+srv://rahulmodak:portfolio@cluster0.kmbsxiz.mongodb.net/?appName=Cluster0";
  if (!MONGO_URI) {
    console.error("MONGO_URI not set. Exiting.");
    process.exit(1);
  }

  try {
    // connect with sensible timeouts
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // keep default, but explicit
      socketTimeoutMS: 45000
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // fail fast so Render restarts or you can debug
  }

  // Define schema & routes after successful connection
  const contactSchema = new mongoose.Schema({
    name: String, email: String, subject: String, message: String, createdAt: { type: Date, default: Date.now }
  });
  const Contact = mongoose.model("Contact", contactSchema);

  app.post("/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) return res.status(400).json({ error: "name, email and message required" });

      const doc = new Contact({ name, email, subject, message });
      await doc.save();
      return res.status(201).json({ success: true, id: doc._id });
    } catch (err) {
      console.error("POST /contact error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  });

  // optional: GET for quick browser test
  app.get("/contact", (req, res) => res.json({ message: "Contact endpoint - use POST" }));

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

start();

// optional: catch unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});
