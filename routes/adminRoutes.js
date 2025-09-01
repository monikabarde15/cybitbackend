// routes/adminRoutes.js
import express from "express";
import { changePassword } from "../controllers/adminController.js";

const router = express.Router();

router.post("/change-password", changePassword);

export default router;
