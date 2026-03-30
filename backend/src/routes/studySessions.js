const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createStudySession, getStudyHistory, getStudyStats } = require('../controllers/studySessionController');

// All study session routes require authentication
router.use(protect);

/**
 * @route   POST /api/study-sessions
 * @desc    Log a new study session
 */
router.post('/', createStudySession);

/**
 * @route   GET /api/study-sessions/history
 * @desc    Get the most recent 30 sessions
 */
router.get('/history', getStudyHistory);

/**
 * @route   GET /api/study-sessions/stats
 * @desc    Get study duration stats for the last 7 days
 */
router.get('/stats', getStudyStats);

module.exports = router;
