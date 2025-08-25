// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (no deprecated options)
mongoose.connect('mongodb+srv://demoadmin:sw8M6RwtzL3v_VN@cluster0.ocsokf8.mongodb.net/testdb?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// Routes
app.use('/api/contact', contactRoutes);

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({});
  if (!admin) return res.status(400).json({ message: "Admin not registered yet" });

  if (email !== admin.email) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: "dummy_admin_token", message: "Login success" });
});



app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
