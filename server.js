// 1️⃣ Load environment variables first
import dotenv from "dotenv";
dotenv.config();


console.log("ENV CHECK:", {
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET
});
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
import adminRoutesnew from "./routes/adminRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import estimationRoutes from "./routes/estimationRoutes.js";
import employees from './routes/employees.js';
import employeeRouter from './routes/auth.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';


import { v2 as cloudinary } from "cloudinary";  // 👈 ये add करो


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

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
const JWT_SECRET = process.env.JWT_SECRET || "1e277147c869def60f7308fa1c003f9d31e83c0ae7e46449bc3a98174793390cfd47efd110b65ff1565e7c7180d6c6f2f8748e143b82ddfc8e9fea0e22cbc329";

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
        "mongodb+srv://shruticybite_db_user:kn5CuWhdreTByugO@cluster0.sk9y8yj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
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
app.use("/api/admin", adminRoutesnew);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/estimation", estimationRoutes);
app.use("/api/employees", employees);
app.use('/api/authEmployee', employeeRouter);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);



app.use((req, res, next) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});


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

    // 👇 yahan email bhi bhejo
    res.json({ token, email: admin.email, message: "Login success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
});

