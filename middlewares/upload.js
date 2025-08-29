import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const storage = new GridFsStorage({
  url: process.env.MONGO_URI || "your_mongo_atlas_uri",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: "resumes", // collection name
      filename: Date.now() + "-" + file.originalname, // unique filename
    };
  },
});

const upload = multer({ storage });
export default upload;
