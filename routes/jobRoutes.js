import express from "express";
import upload from "../middlewares/upload.js"; // multer-s3 setup
import Application from "../models/Application.js";

const router = express.Router();

// ✅ Submit a new job application
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

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

    // Validate required fields
    if (!role || !fullName || !email || !phone || !workplaceType || !jobLocation || !employmentType) {
      console.log("Validation failed");
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    // S3 file URL
    const resume = req.file?.location;
    if (!resume) {
      console.log("Resume upload failed", req.file);
      return res.status(400).json({ success: false, message: "Resume upload failed" });
    }

    const application = new Application({
      role,
      fullName,
      email,
      phone,
      workplaceType,
      jobLocation,
      employmentType,
      resume,
      message: message || "",
    });

    console.log("Saving application to DB...");
    await application.save();
    console.log("Saved successfully");

    res.status(201).json({ success: true, message: "Application submitted successfully!", application });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
});


// ✅ Get all job applications (latest first)
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
