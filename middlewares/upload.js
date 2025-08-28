import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME, // ✅ bucket defined
    acl: "public-read",
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}_${file.originalname}`;
      cb(null, uniqueName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // handle PDF/images automatically
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

export default upload;
