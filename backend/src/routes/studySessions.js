const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createStudySession, getStudyHistory, getStudyStats, updateStudySession, deleteStudySession } = require('../controllers/studySessionController');

// All study session routes require authentication
router.use(protect);

// Validation rules
const sessionValidation = [
  body('duration').isNumeric().withMessage('Duration is required and must be a number'),
  body('subject').notEmpty().withMessage('Subject ID is required'),
];

/**
 * @route   POST /api/study-sessions
 * @desc    Log a new study session
 */
router.post('/', sessionValidation, createStudySession);

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

/**
 * @route   PUT /api/study-sessions/:id
 * @desc    Update a study session
 */
router.put('/:id', updateStudySession);

/**
 * @route   DELETE /api/study-sessions/:id
 * @desc    Delete a study session
 */
router.delete('/:id', deleteStudySession);

module.exports = router;
