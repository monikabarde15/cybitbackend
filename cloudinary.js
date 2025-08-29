import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer config for temporary uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // existing uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

export const upload = multer({ storage });
export { cloudinary };
