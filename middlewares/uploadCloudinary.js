import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer storage (temporary local uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // ensure uploads/ exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "resumes",      // ✅ all resumes go here
      resource_type: "raw",   // ✅ force raw => pdf/doc/docx viewable
      use_filename: true,     // keep original filename
      unique_filename: true,  // avoid overwrite
    });
    fs.unlinkSync(filePath); // delete local file after upload
    return result.secure_url; // public https URL
  } catch (err) {
    try {
      fs.unlinkSync(filePath);
    } catch {}
    throw err;
  }
};

export default upload;
