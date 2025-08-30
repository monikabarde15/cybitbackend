import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Blog from "../models/Blog.js";

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
    folder: "blogs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// ======================
// Create Blog
// ======================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    console.log("REQ FILE:", req.file); // Debug: ensure file is received

    const newBlog = new Blog({
      title,
      description,
      image: req.file?.path || null,
      imageId: req.file?.filename || null,
    });

    await newBlog.save();
    res.status(201).json({ success: true, message: "Blog created", data: newBlog });
  } catch (err) {
    console.error("POST /blogs ERROR:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ======================
// Get All Blogs
// ======================
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (err) {
    console.error("GET /blogs ERROR:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ======================
// Update Blog
// ======================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    const { title, description } = req.body;
    blog.title = title || blog.title;
    blog.description = description || blog.description;

    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (blog.imageId) {
        await cloudinary.uploader.destroy(blog.imageId).catch(console.error);
      }
      blog.image = req.file.path;
      blog.imageId = req.file.filename;
    }

    await blog.save();
    res.json({ success: true, message: "Blog updated", data: blog });
  } catch (err) {
    console.error("PUT /blogs/:id ERROR:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ======================
// Delete Blog
// ======================
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (blog.imageId) {
      await cloudinary.uploader.destroy(blog.imageId).catch(console.error);
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("DELETE /blogs/:id ERROR:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
