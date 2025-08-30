import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    imageId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
