import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose from "mongoose";
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
    public_id: (req, file) =>
      Date.now() + "-" + file.originalname.split(".")[0], // unique filename
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
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const newBlog = new Blog({
      title,
      description,
      image: req.file?.path || null,
      imageId: req.file?.filename || null, // Cloudinary public_id
    });

    await newBlog.save();
    res
      .status(201)
      .json({ success: true, message: "Blog created", data: newBlog });
  } catch (err) {
    console.error("POST /blogs ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Get Single Blog
// ======================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.json({ success: true, data: blog });
  } catch (err) {
    console.error("GET /blogs/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Update Blog
// ======================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const { title, description } = req.body;
    blog.title = title || blog.title;
    blog.description = description || blog.description;

    if (req.file) {
      // delete old image from Cloudinary
      if (blog.imageId) {
        await cloudinary.uploader.destroy(blog.imageId);
      }
      blog.image = req.file.path;
      blog.imageId = req.file.public_id;
    }

    await blog.save();
    res.json({ success: true, message: "Blog updated", data: blog });
  } catch (err) {
    console.error("PUT /blogs/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

// ======================
// Delete Blog
// ======================
// ======================
// Delete Blog
// ======================
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete request for:", req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    console.log("Found blog:", blog);

    if (blog.imageId) {
      console.log("Deleting Cloudinary imageId:", blog.imageId);
      try {
        const result = await cloudinary.uploader.destroy(blog.imageId);
        console.log("Cloudinary delete result:", result);
      } catch (err) {
        console.error("Cloudinary delete error:", err);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error("DELETE /blogs/:id ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


export default router;
