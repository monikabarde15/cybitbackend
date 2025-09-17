import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  quantity: { type: Number, default: 1 },
  amount: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    invoiceLabel: String,
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },

    billing: {
      name: String,
      email: String,
      address: String,
      phone: String,
    },

    paymentDetails: {
      accountNumber: String,
      bankName: String,
      swiftNumber: String,
      ibanNumber: String,
      country: String,
    },

    items: [itemSchema],

    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },

    // ✅ Currency field improved
    currency: {
      type: String,
      enum: [
        "USD - US Dollar",
        "GBP - British Pound",
        "IDR - Indonesian Rupiah",
        "INR - Indian Rupee",
        "BRL - Brazilian Real",
        "EUR - Germany (Euro)",
        "TRY - Turkish Lira",
      ],
      default: "USD - US Dollar",
    },

    notes: String,
  },
  { timestamps: true } // ✅ auto createdAt & updatedAt
);

export default mongoose.model("Invoice", invoiceSchema);
