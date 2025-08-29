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
    folder: "resumes",
    resource_type: "auto",   // ✅ auto detect pdf/docx
    use_filename: true,
    unique_filename: true,
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
