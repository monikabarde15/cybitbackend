import express from "express";
import upload from "../middlewares/upload.js";
import Application from "../models/Application.js";

const router = express.Router();

// ✅ Submit Job Application
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      phone,
      workplaceType,
      jobLocation,
      employmentType,
      message,
    } = req.body;

    // Validation
    if (!role || !fullName || !email || !phone || !workplaceType || !jobLocation || !employmentType) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    // ✅ Save local path
    const resumePath = `/uploads/${req.file.filename}`;

    const application = new Application({
      role,
      fullName,
      email,
      phone,
      workplaceType,
      jobLocation,
      employmentType,
      resume: resumePath,
      message: message || "",
    });

    await application.save();
    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
