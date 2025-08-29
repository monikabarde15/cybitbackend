import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Blog from "../models/Blog.js";

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("✅ uploads/ folder created");
}

// ✅ Multer Storage Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
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

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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

    // Delete old image only if new one is uploaded
    if (req.file && blog.image) {
      const oldImagePath = path.join(uploadDir, path.basename(blog.image));
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : blog.image;

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.image = imageUrl;

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

    // Delete image if exists
    if (blog.image) {
      const imagePath = path.join(uploadDir, path.basename(blog.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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
