const StudySession = require('../models/StudySession');
const { validationResult } = require('express-validator');

/**
 * POST /api/study-sessions
 * Record a completed study session
 */
const createStudySession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { subject, topic, duration, startTime, endTime, type } = req.body;

    const studySession = await StudySession.create({
      user: req.user._id,
      subject,
      topic,
      duration,
      startTime: startTime || new Date(Date.now() - duration * 60 * 1000),
      endTime: endTime || new Date(),
      type: type || 'FOCUS',
    });

    res.status(201).json({ success: true, data: studySession });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-sessions/history
 * Get user's study session history
 */
const getStudyHistory = async (req, res, next) => {
  try {
    // Get last 30 sessions with populated subject/topic info
    const history = await StudySession.find({ user: req.user._id })
      .populate('subject', 'name icon color')
      .populate('topic', 'title')
      .sort({ startTime: -1 })
      .limit(30);

    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/study-sessions/stats
 * Get study time stats for the last 7 days
 */
const getStudyStats = async (req, res, next) => {
  try {
    const daysAgo7 = new Date();
    daysAgo7.setDate(daysAgo7.getDate() - 7);
    daysAgo7.setHours(0, 0, 0, 0);

    const stats = await StudySession.aggregate([
      {
        $match: {
          user: req.user._id,
          startTime: { $gte: daysAgo7 },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startTime' } },
          totalMinutes: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStudySession, getStudyHistory, getStudyStats };
