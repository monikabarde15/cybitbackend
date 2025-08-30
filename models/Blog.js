import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    imageId: { type: String }, // store Cloudinary public_id
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
