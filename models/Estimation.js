import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  quantity: Number,
  amount: Number
});

const EstimationSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  invoiceLabel: String,
  invoiceDate: Date,
  dueDate: Date,
  billing: {
    name: String,
    email: String,
    address: String,
    phone: String
  },
  paymentDetails: {
    accountNumber: String,
    bankName: String,
    swiftNumber: String,
    ibanNumber: String,
    country: String
  },
  items: [itemSchema],
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Estimation", EstimationSchema);
