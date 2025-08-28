// routes/contactRoutes.js
import express from "express";
import Contact from "../models/Contact.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ============================
// 1. Save Contact (POST)
// ============================
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

// ============================
// 2. Get All Contacts (GET)
// ============================
router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // latest first
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching contacts", error: error.message });
  }
});

// ============================
// 3. Delete Contact (DELETE)
// ============================
router.delete("/:id", async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting contact", error: error.message });
  }
});

// ============================
// 4. Reply to Contact (Send Email)
// ============================
router.post("/reply/:id", async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // या smtp config डाल सकते हो
      auth: {
        user: process.env.EMAIL_USER,  // .env में email
        pass: process.env.EMAIL_PASS,  // .env में password/app password
      },
    });

    // Mail Options
    const mailOptions = {
      from: `"Admin" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: "Reply to your query",
      text: replyMessage,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Reply sent successfully!" });
  } catch (error) {
    console.error("❌ Email Error:", error);
    res.status(500).json({ success: false, message: "Error sending reply", error: error.message });
  }
});

export default router;
