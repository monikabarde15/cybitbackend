import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Application from "../models/Application.js";

const router = express.Router();
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { role, fullName, email, phone, workplaceType, jobLocation, employmentType, message } = req.body;
    if (!role || !fullName || !email || !phone || !workplaceType || !jobLocation || !employmentType) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const resume = req.file ? `/uploads/${req.file.filename}` : '';

    const newApplication = new Application({
      role, fullName, email, phone, workplaceType, jobLocation, employmentType, resume, message: message || ''
    });

    await newApplication.save();
    res.status(200).json({ success: true, message: "Application submitted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error submitting application.", error: error.message });
  }
});

export default router;
