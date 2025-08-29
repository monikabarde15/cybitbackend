import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure upload folder exists
const uploadDir = "uploads/resumes";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer Storage Config (Local Disk)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // store in uploads/resumes
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
