import express from "express";
import upload, { uploadToCloudinary } from "../middlewares/uploadCloudinary.js";
import Application from "../models/Application.js";

const router = express.Router();

// Submit Job Application with Cloudinary upload
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
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

    // Upload resume to Cloudinary
    const resumeUrl = await uploadToCloudinary(req.file.path);

    const application = new Application({
      role,
      fullName,
      email,
      phone,
      workplaceType,
      jobLocation,
      employmentType,
      resume: resumeUrl,
      message: message || "",
    });

    await application.save();
    res.status(201).json({ success: true, message: "Application submitted successfully!", application });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ✅ Get all job applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ✅ Update application status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    res.status(200).json({ success: true, message: "Status updated successfully", application });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ✅ Delete a job application
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Application not found" });

    res.status(200).json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

export default router;
