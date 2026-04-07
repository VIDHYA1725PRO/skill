const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { store, uuidv4 } = require('../store');
const { auth, JWT_SECRET } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = store.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.json({ token, user: userSafe });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student', grade, subject } = req.body;
    if (store.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, password: hashed, role, avatar: name[0].toUpperCase(), createdAt: new Date().toISOString(), grade, subject, certificates: [], phone: '' };
    store.users.push(user);
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userSafe } = user;
    res.status(201).json({ token, user: userSafe });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const idx = store.users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });
    const { name, phone, bio, grade, subject } = req.body;
    store.users[idx] = { ...store.users[idx], name: name || store.users[idx].name, phone, bio, grade, subject };
    const { password: _, ...userSafe } = store.users[idx];
    res.json(userSafe);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
