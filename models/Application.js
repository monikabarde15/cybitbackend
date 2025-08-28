import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  role: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  workplaceType: { type: String, required: true, enum: ['Remote', 'Hybrid', 'Onsite'] },
  jobLocation: { type: String, required: true },
  employmentType: { type: String, required: true, enum: ['Full-Time', 'Part-Time', 'Internship'] },
  resume: { type: String, required: true },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Application", applicationSchema);
