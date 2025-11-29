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
// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

// Configure CORS: allow specific origin if FRONTEND_URL is provided, otherwise allow all (for quick testing)
const allowedOrigin = process.env.FRONTEND_URL || "*";
app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// Simple logging helper
const log = (...args) => console.log(new Date().toISOString(), ...args);

// Basic routes that are always available
app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get("/", (req, res) => res.send("Backend is running."));

// Start/initialize app after DB connection
const start = async () => {
  const MONGO_URI = "mongodb+srv://rahulmodak:portfolio@cluster0.kmbsxiz.mongodb.net/?appName=Cluster0";
  if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is not set. Please set it in environment variables.");
    process.exit(1);
  }

  try {
    // Connect to MongoDB (do NOT pass useNewUrlParser/useUnifiedTopology here)
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // fail fast so the platform restarts or you can debug
  }

  // Define schema & model AFTER successful connection
  const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, maxlength: 200 },
    subject: { type: String, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  });

  const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

  // POST /contact - save contact message
  app.post("/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Basic server-side validation
      if (!name || !email || !message) {
        return res.status(400).json({ error: "name, email and message are required" });
      }

      const doc = new Contact({ name, email, subject, message });
      await doc.save();

      // return created response
      return res.status(201).json({ success: true, id: doc._id });
    } catch (err) {
      console.error("POST /contact error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /contact for quick browser testing (optional)
  app.get("/contact", (req, res) => res.json({ message: "Contact endpoint — use POST to submit data" }));

  // Start server
  const port = process.env.PORT || 4000;
  app.listen(port, () => log(`Server listening on port ${port}`));
};

// graceful shutdown
process.on("SIGINT", () => {
  log("SIGINT received - closing mongoose connection");
  mongoose.connection.close(() => {
    log("Mongoose connection closed. Exiting process.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

start();
