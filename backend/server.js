require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const subjectRoutes = require('./src/routes/subjects');
const topicRoutes = require('./src/routes/topics');
const dashboardRoutes = require('./src/routes/dashboard');
const studyRoutes = require('./src/routes/studySessions');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/study-sessions', studyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Study Tracker API is running 🚀' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});
