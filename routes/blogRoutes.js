// routes/blogRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Blog from "../models/Blog.js";

const router = express.Router();

/* ========================================================
   📌 Cloudinary Config
======================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ========================================================
   📌 Multer + Cloudinary Storage
======================================================== */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

/* ========================================================
   📌 Create Blog
======================================================== */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res.status(400).json({ success: false, message: "Title and Description are required" });

    const newBlog = new Blog({
      title,
      description,
      image: req.file?.path || null,
      imageId: req.file?.filename || null, // store Cloudinary public_id
    });

    await newBlog.save();

    res.status(201).json({ success: true, message: "Blog created successfully", data: newBlog });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

/* ========================================================
   📌 Get All Blogs
======================================================== */
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, data: blogs });
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

/* ========================================================
   📌 Delete Blog
======================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    if (blog.imageId) {
      await cloudinary.uploader.destroy(blog.imageId);
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

/* ========================================================
   📌 Update Blog
======================================================== */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

    // Update fields
    blog.title = title || blog.title;
    blog.description = description || blog.description;

    // If new image uploaded, replace old image
    if (req.file) {
      // Delete old image from Cloudinary
      if (blog.imageId) {
        await cloudinary.uploader.destroy(blog.imageId);
      }
      blog.image = req.file.path;
      blog.imageId = req.file.filename;
    }

    await blog.save();
    res.json({ success: true, message: "Blog updated successfully", data: blog });
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

export default router;
