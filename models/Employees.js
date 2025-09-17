import mongoose from "mongoose";

const EmployeesSchema = new mongoose.Schema(
  {
    // Employee Info
    employeeNumber: { type: String, required: true },
    department: String,
    designation: String,
    dateOfJoining: Date,

    // Personal Details
    name: String,
    email: String,
    mobileNumber: String,
    gender: String,
    fatherName: String,
    motherName: String,
    contactNumber: String,
    maritalStatus: String,

    // Current Address
    currentAddressLine1: String,
    currentCity: String,
    currentDistrict: String,
    currentState: String,
    currentPostalCode: String,
    currentCountry: String,
    currentLandmark: String,

    // Permanent Address
    permanentAddressLine1: String,
    permanentCity: String,
    permanentDistrict: String,
    permanentState: String,
    permanentPostalCode: String,
    permanentCountry: String,
    permanentLandmark: String,

    // Bank Details
    aadharNumber: String,
    panNumber: String,
    pfAccount: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,

    // Earnings & Deductions
    basic: String,
    hra: String,
    sa: String,
    pt: String,
    pfEc: String,
    tds: String,
    tax: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    salary: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },

    // Notes
    notes: String,

    // Optional Files (store filename or URL)
    aadharFile: String,
    panFile: String,
    companyLogo: String,
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

export default mongoose.model("Employee", EmployeesSchema);
