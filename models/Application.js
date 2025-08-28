import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please enter a valid phone number"]
    },
    workplaceType: { 
      type: String, 
      required: true, 
      enum: ['Remote', 'Hybrid', 'Onsite'] 
    },
    jobLocation: { type: String, required: true },
    employmentType: { 
      type: String, 
      required: true, 
      enum: ['Full-Time', 'Part-Time', 'Internship'] 
    },
    resume: { type: String, required: true }, // should store S3 URL
    message: { type: String, default: '', trim: true },
    status: { 
      type: String, 
      enum: ["Pending", "Shortlisted", "Rejected"], 
      default: "Pending" 
    },
  },
  {
    timestamps: true // automatically adds createdAt & updatedAt
  }
);

export default mongoose.model("Application", applicationSchema);
