import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Employee from '../models/Employees.js';

const router = express.Router();
const JWT_SECRET = '1e277147c869def60f7308fa1c003f9d31e83c0ae7e46449bc3a98174793390cfd47efd110b65ff1565e7c7180d6c6f2f8748e143b82ddfc8e9fea0e22cbc329';//process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(400).json({ message: 'Employee not found' });

    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: employee._id, email: employee.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, message: 'Login successful', user: employee });
  } catch (err) {
    console.error("Login route error:", err);  // Log full error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


router.get('/test', (req, res) => res.send('Auth router test route active'));


export default router;
