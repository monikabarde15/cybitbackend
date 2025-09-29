import jwt from 'jsonwebtoken';
import Employee from '../models/Employees.js';

const JWT_SECRET = '1e277147c869def60f7308fa1c003f9d31e83c0ae7e46449bc3a98174793390cfd47efd110b65ff1565e7c7180d6c6f2f8748e143b82ddfc8e9fea0e22cbc329'; // Preferably use process.env.JWT_SECRET

export async function authenticateEmployee(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header or invalid format');
    return res.status(401).json({ message: 'Unauthorized: No token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    const employee = await Employee.findById(decoded.id).select('-password');
    if (!employee) {
      console.log('Employee not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    req.employee = employee; // Attach employee data to request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
}
