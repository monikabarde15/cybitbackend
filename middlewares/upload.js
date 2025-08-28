import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION || "ap-south-1",
});

console.log("S3 Bucket:", process.env.S3_BUCKET_NAME);

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "public-read",
    key: (req, file, cb) => {
      const folder = file.fieldname === "resume" ? "resumes/" : "blogs/";
      cb(null, `${folder}${Date.now()}_${file.originalname}`);
    },
  }),
});

export default upload;
