const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedData } = require('./store');
const connectDB = require('./config/db');
require('dotenv').config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// Create upload dirs
const fs = require('fs');
['uploads/assignments', 'uploads/certificates'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api', require('./routes/misc'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SkillBridge API Running' }));

seedData().then(() => {
  app.listen(PORT, () => {
    console.log(process.env.MONGO_URI);
    console.log(`🚀 SkillBridge Backend running on http://localhost:${PORT}`);
    console.log(`\n📋 Test Credentials:`);
    console.log(`  Admin:   admin@skillbridge.com / admin123`);
    console.log(`  Teacher: sarah@skillbridge.com / teacher123`);
    console.log(`  Student: alice@skillbridge.com / student123`);
  });
});
