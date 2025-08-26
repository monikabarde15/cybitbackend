const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");

// ✅ Create Blog
router.post("/", async (req, res) => {
  try {
    const { title, image, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and Description are required" });
    }

    const newBlog = new Blog({ title, image, description });
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

// ✅ Get Single Blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: blog });
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// ✅ Update Blog
router.put("/:id", async (req, res) => {
  try {
    const { title, image, description } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, image, description },
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

module.exports = router;
