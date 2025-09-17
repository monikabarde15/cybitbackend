import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employees.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

const router = express.Router();

// ======================
// Cloudinary Config
// ======================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ======================
// Multer + Cloudinary Storage
// ======================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "employees",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => Date.now() + "-" + file.originalname.split(".")[0],
  },
});
const upload = multer({ storage });

// Multiple files fields
const cpUpload = upload.fields([{ name: "companyLogo", maxCount: 1 }]);

// ======================
// Add Employee
// ======================
router.post("/", cpUpload, async (req, res) => {
  try {
    const {
      employeeNumber,
      department,
      designation,
      dateOfJoining,
      name,
      email,
      mobileNumber,
      gender,
      fatherName,
      motherName,
      contactNumber,
      maritalStatus,
      currentAddressLine1,
      currentCity,
      currentDistrict,
      currentState,
      currentPostalCode,
      currentCountry,
      currentLandmark,
      permanentAddressLine1,
      permanentCity,
      permanentDistrict,
      permanentState,
      permanentPostalCode,
      permanentCountry,
      permanentLandmark,
      aadharNumber,
      panNumber,
      pfAccount,
      bankName,
      accountNumber,
      ifscCode,
      basic,
      hra,
      sa,
      pt,
      pfEc,
      tds,
      tax,
      deduction,
      salary,
      currency,
      notes,
    } = req.body;

    const newEmployee = new Employee({
      employeeNumber,
      department,
      designation,
      dateOfJoining,
      name,
      email,
      mobileNumber,
      gender,
      fatherName,
      motherName,
      contactNumber,
      maritalStatus,
      currentAddressLine1,
      currentCity,
      currentDistrict,
      currentState,
      currentPostalCode,
      currentCountry,
      currentLandmark,
      permanentAddressLine1,
      permanentCity,
      permanentDistrict,
      permanentState,
      permanentPostalCode,
      permanentCountry,
      permanentLandmark,
      aadharNumber,
      panNumber,
      pfAccount,
      bankName,
      accountNumber,
      ifscCode,
      basic,
      hra,
      sa,
      pt,
      pfEc,
      tds,
      tax,
      deduction,
      salary,
      currency,
      notes,
      companyLogo: req.files?.["companyLogo"]?.[0]?.path || "",
    });

    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// List All Employees
// ======================
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// Preview / Single Employee
// ======================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// Update Employee
// ======================
router.put("/:id", cpUpload, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const fields = [
      "employeeNumber","department","designation","dateOfJoining","name","email","mobileNumber",
      "gender","fatherName","motherName","contactNumber","maritalStatus",
      "currentAddressLine1","currentCity","currentDistrict","currentState","currentPostalCode","currentCountry","currentLandmark",
      "permanentAddressLine1","permanentCity","permanentDistrict","permanentState","permanentPostalCode","permanentCountry","permanentLandmark",
      "aadharNumber","panNumber","pfAccount","bankName","accountNumber","ifscCode",
      "basic","hra","sa","pt","pfEc","tds","tax","deduction","salary","currency","notes"
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) employee[f] = req.body[f];
    });

    if (req.files?.["companyLogo"]?.[0]?.path) {
      employee.companyLogo = req.files["companyLogo"][0].path;
    }

    await employee.save();
    res.json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ======================
// Delete Employee
// ======================
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "Invalid ID" });

    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    // Delete companyLogo from Cloudinary if exists
    const fileUrl = employee.companyLogo;
    if (fileUrl) {
      const parts = fileUrl.split("/");
      const folderIndex = parts.findIndex((p) => p === "employees");
      if (folderIndex !== -1) {
        const public_id = parts.slice(folderIndex).join("/").split(".")[0];
        await cloudinary.uploader.destroy(public_id);
      }
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
