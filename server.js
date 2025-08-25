import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";
import Admin from "./models/Admin.js"; // <- import Admin model

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb+srv://demoadmin:sw8M6RwtzL3v_VN@cluster0.ocsokf8.mongodb.net/testdb?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  const existingAdmin = await Admin.findOne({});
  if (existingAdmin) return res.status(403).json({ message: "Admin already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hashedPassword });
  await admin.save();
  res.json({ message: "Admin registered successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({});
  if (!admin) return res.status(400).json({ message: "Admin not registered yet" });

  if (email !== admin.email) return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: "dummy_admin_token", message: "Login success" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
