// 1️⃣ Load environment variables first
import dotenv from "dotenv";
dotenv.config();

// 2️⃣ Imports
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";

import Admin from "./models/Admin.js"; 
import contactRoutes from "./routes/contactRoutes.js"; 
import blogRoutes from "./routes/blogRoutes.js";

// 3️⃣ Constants
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// 4️⃣ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded images

// 5️⃣ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 6️⃣ Routes
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogRoutes);

// 7️⃣ Admin Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(403).json({ message: "Admin already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();

    res.json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error: error.message });
  }
});

// 8️⃣ Admin Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not registered yet" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, message: "Login success" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

// 9️⃣ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
