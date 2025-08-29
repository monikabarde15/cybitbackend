import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
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
    folder: "blogs", // ✅ Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

/* ========================================================
   📌 Create Blog (Image Optional)
======================================================== */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    const imageUrl = req.file ? req.file.path : null; // ✅ Cloudinary URL

    const newBlog = new Blog({
      title,
      description,
      image: imageUrl,
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "✅ Blog created successfully",
      data: newBlog,
    });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

/* ========================================================
   📌 Get Single Blog
======================================================== */
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

/* ========================================================
   📌 Update Blog (Image Optional)
======================================================== */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (req.file) {
      blog.image = req.file.path; // ✅ Cloudinary URL
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;

    await blog.save();

    res.json({
      success: true,
      message: "✅ Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

/* ========================================================
   📌 Delete Blog
======================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    // ✅ Delete from Cloudinary if image exists
    if (blog.image) {
      const publicId = blog.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`blogs/${publicId}`);
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "✅ Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

export default router;
