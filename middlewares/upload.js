import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Uploads folder ensure
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Multer disk storage (local uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // uploads/ folder me save hoga
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
