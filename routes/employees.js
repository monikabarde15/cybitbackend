import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employees.js";
import { authenticateEmployee } from '../middlewares/authenticateEmployee.js';

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import bcrypt from 'bcryptjs';

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};

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
      password,
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
      previousCompany,
      previousPosition,
      previousSalary,
      previousDOR,
    } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

        const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      employeeNumber,
      department,
      designation,
      dateOfJoining,
      name,
      email,
      password: hashedPassword,
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
      previousCompany,
      previousPosition,
      previousSalary,
      previousDOR,
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
      "basic","hra","sa","pt","pfEc","tds","tax","deduction","salary","currency","notes",
      "previousCompany","previousPosition","previousSalary","previousDOR"
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

// router already mounted on /api/employees
router.put('/:id/permissionsnew', async (req, res) => {
  const { id } = req.params;
  const { role, permissions } = req.body;

  try {
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).send('Employee not found');

    employee.role = 'employee';
    employee.permissions = permissions;
    await employee.save();

    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// Import authentication middleware पहले से है: import { authenticateEmployee } from '../middlewares/authenticateEmployee.js';

// Check duplicate route अब authenticated users के लिए
router.post('/check-duplicate', async (req, res) => {
  try {
    const { 
      employeeNumber, 
      email, 
      aadharNumber, 
      panNumber, 
      mobileNumber, 
      contactNumber, 
      accountNumber, 
      excludeId 
    } = req.body;

    const duplicateFields = [];
    let exists = false;

    const conditions = [];

    if (employeeNumber) {
      conditions.push({ employeeNumber: employeeNumber.trim() });
    }
    if (email) {
      conditions.push({ email: email.toLowerCase().trim() });
    }
    if (aadharNumber) {
      conditions.push({ aadharNumber: aadharNumber.trim() });
    }
    if (panNumber) {
      conditions.push({ panNumber: panNumber.toUpperCase().trim() });
    }
    if (mobileNumber) {
      conditions.push({ mobileNumber: mobileNumber.trim() });
    }
    if (contactNumber && contactNumber !== mobileNumber) {
      conditions.push({ contactNumber: contactNumber.trim() });
    }
    if (accountNumber) {
      conditions.push({ accountNumber: accountNumber.trim() });
    }

    if (conditions.length === 0) {
      return res.json({ exists: false, duplicateFields: [] });
    }

    let query = { $or: conditions };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingEmployees = await Employee.find(query).select(
      'employeeNumber email aadharNumber panNumber mobileNumber contactNumber accountNumber'
    );

    for (const emp of existingEmployees) {
      if (employeeNumber && emp.employeeNumber === employeeNumber.trim()) {
        duplicateFields.push('Employee Number');
        exists = true;
      }
      if (email && emp.email === email.toLowerCase().trim()) {
        duplicateFields.push('Email');
        exists = true;
      }
      if (aadharNumber && emp.aadharNumber === aadharNumber.trim()) {
        duplicateFields.push('Aadhar Number');
        exists = true;
      }
      if (panNumber && emp.panNumber === panNumber.toUpperCase().trim()) {
        duplicateFields.push('PAN Number');
        exists = true;
      }
      if (mobileNumber && emp.mobileNumber === mobileNumber.trim()) {
        duplicateFields.push('Mobile Number');
        exists = true;
      }
      if (contactNumber && emp.contactNumber === contactNumber.trim()) {
        duplicateFields.push('Contact Number');
        exists = true;
      }
      if (accountNumber && emp.accountNumber === accountNumber.trim()) {
        duplicateFields.push('Account Number');
        exists = true;
      }
    }

    const uniqueDuplicateFields = [...new Set(duplicateFields)];

    res.json({
      exists,
      duplicateFields: uniqueDuplicateFields,
      message: exists ? `Duplicate found: ${uniqueDuplicateFields.join(', ')}` : 'No duplicates found'
    });
  } catch (error) {
    console.error('Error checking duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking for duplicates',
      error: error.message
    });
  }
});

router.get('/me', authenticateEmployee, (req, res) => {
  // req.employee is the authenticated user
  console.log('Route /me hit with authenticated user:', req.employee);
  res.json(req.employee);
});
export default router;
