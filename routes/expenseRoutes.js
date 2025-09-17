import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";

const router = express.Router();

// ======================
// Cloudinary Config
// ======================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ======================
// Multer + Cloudinary Storage
// ======================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expenses",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.split(".")[0],
  },
});

const upload = multer({ storage });

// ======================
// Create Expense
// ======================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required",
      });
    }

    const newExpense = new Expense({
      title,
      description,
      price,
      image: req.file?.path || null,     // Cloudinary URL
      imageId: req.file?.filename || null, // Cloudinary public_id
    });

    await newExpense.save();
    res
      .status(201)
      .json({ success: true, message: "Expense created", data: newExpense });
  } catch (err) {
    console.error("POST /expenses ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Get All Expenses
// ======================
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error("GET /expenses ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================
// Get Single Expense
// ======================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    console.error("GET /expenses/:id ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================
// Update Expense
// ======================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const { title, description, price } = req.body;
    expense.title = title || expense.title;
    expense.description = description || expense.description;
    expense.price = price || expense.price;

    if (req.file) {
      // delete old image from Cloudinary
      if (expense.imageId) {
        await cloudinary.uploader.destroy(expense.imageId);
      }
      expense.image = req.file.path;
      expense.imageId = req.file.filename;
    }

    await expense.save();
    res.json({ success: true, message: "Expense updated", data: expense });
  } catch (err) {
    console.error("PUT /expenses/:id ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================
// Delete Expense
// ======================
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid Expense ID" });
    }

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    if (expense.imageId) {
      try {
        await cloudinary.uploader.destroy(expense.imageId);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("DELETE /expenses/:id ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
