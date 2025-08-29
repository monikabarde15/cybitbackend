import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Application from "../models/Application.js";

const router = express.Router();

// ✅ MongoDB Connection String (apna MongoDB URI daalo)
const mongoURI = "mongodb://127.0.0.1:27017/visionlex"; 
// Agar Mongo Atlas use karte ho to yaha URI paste karo

// ✅ GridFS Storage Setup
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: "resumes", // ✅ GridFS bucket name
      filename: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({ storage });

// ✅ Submit Job Application (store file in GridFS)
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

    if (
      !role ||
      !fullName ||
      !email ||
      !phone ||
      !workplaceType ||
      !jobLocation ||
      !employmentType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be provided" });
    }

    if (!req.file || !req.file.id) {
      return res
        .status(400)
        .json({ success: false, message: "Resume file is required" });
    }

    // ✅ GridFS file ID store kar rahe hai
    const application = new Application({
      role,
      fullName,
      email,
      phone,
      workplaceType,
      jobLocation,
      employmentType,
      resume: req.file.id, // GridFS file ID
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

// ✅ Get all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ✅ Download resume by ID
router.get("/resume/:id", async (req, res) => {
  try {
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "resumes",
    });

    const _id = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = bucket.openDownloadStream(_id);

    downloadStream.on("error", () =>
      res.status(404).json({ success: false, message: "File not found" })
    );

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ✅ Update application status
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ✅ Delete application
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
