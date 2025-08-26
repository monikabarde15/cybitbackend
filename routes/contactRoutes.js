// routes/contactRoutes.js
import express from "express";
import Contact from "../models/Contact.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { firstName, email, phone, message } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newContact = new Contact({ firstName, email, phone, message });
    await newContact.save();

    res.status(201).json({ success: true, message: "Data saved successfully" });
  } catch (error) {
    console.error("❌ Backend Error:", error);
    res.status(500).json({ success: false, message: "Error saving data", error: error.message });
  }
});

export default router;  // ✅ default export
