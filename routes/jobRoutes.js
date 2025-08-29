import express from "express";
import upload from "../middlewares/upload.js";
import Application from "../models/Application.js";

const router = express.Router();

// ✅ Submit Job Application (POST)
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

    if (!role || !fullName || !email || !phone || !workplaceType || !jobLocation || !employmentType) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Resume file is required" });
    }

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
    res.status(201).json({ success: true, message: "Application submitted successfully!", application });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ✅ Get all applications (GET)
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Update application status (PATCH)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Shortlisted", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    res.json({ success: true, message: `Status updated to ${status}`, application });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

// ✅ Delete an application (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});

export default router;
