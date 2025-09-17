import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,   // Cloudinary URL
  imageId: String, // Cloudinary public_id
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", expenseSchema);
