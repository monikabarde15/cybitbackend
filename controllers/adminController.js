// controllers/adminController.js
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // 1. Admin find करो
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Old password verify करो
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // 3. New password hash करके save करो
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
