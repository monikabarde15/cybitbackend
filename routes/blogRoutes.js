import express from "express";
import multer from "multer";
import path from "path";
import Blog from "../models/Blog.js";

const router = express.Router();

// ✅ Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique name
  },
});

const upload = multer({ storage });

// ✅ Create Blog
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and Description are required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlog = new Blog({ title, description, image: imageUrl });
    await newBlog.save();

    res.status(201).json({ success: true, message: "Blog created successfully", data: newBlog });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// ✅ Get All Blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// ✅ Update Blog
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, image: imageUrl },
      { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ success: false, message: "Blog not found" });

    res.json({ success: true, message: "Blog updated", data: updatedBlog });
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// ✅ Delete Blog
router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ success: false, message: "Blog not found" });

    res.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

export default router;
