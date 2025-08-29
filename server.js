// 1️⃣ Load environment variables first
import dotenv from "dotenv";
dotenv.config();

// 2️⃣ ESM __dirname setup
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3️⃣ Imports
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs";

import Admin from "./models/Admin.js";
import contactRoutes from "./routes/contactRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";

// 4️⃣ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ uploads/ folder created");
}

// 5️⃣ Express app
const app = express();

// 6️⃣ Constants
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// 7️⃣ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve uploads folder statically
app.use("/uploads", express.static(uploadDir));

// 8️⃣ MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://demoadmin:sw8M6RwtzL3v_VN@cluster0.ocsokf8.mongodb.net/testdb?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB connected");

    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// 9️⃣ Routes
app.use("/api/contact", contactRoutes);
app.use("/api/apply", jobRoutes);
app.use("/api/blogs", blogRoutes);

// 🔟 Admin Register
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
    res
      .status(500)
      .json({ message: "Error registering admin", error: error.message });
  }
});

// 1️⃣1️⃣ Admin Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Admin not registered yet" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, message: "Login success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
});
