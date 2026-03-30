const { validationResult } = require('express-validator');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

/**
 * GET /api/subjects
 * Get all subjects for the authenticated user
 */
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Attach topic stats to each subject
    const subjectsWithStats = await Promise.all(
      subjects.map(async (subject) => {
        const topics = await Topic.find({ subject: subject._id });
        const totalTopics = topics.length;
        const completedTopics = topics.filter((t) => t.status === 'COMPLETED').length;
        const averageProgress =
          totalTopics > 0
            ? Math.round(topics.reduce((sum, t) => sum + t.progress, 0) / totalTopics)
            : 0;

        return {
          ...subject.toObject(),
          totalTopics,
          completedTopics,
          averageProgress,
        };
      })
    );

    res.json({ success: true, data: subjectsWithStats });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/subjects
 * Create a new subject
 */
const createSubject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, color, examDate, icon } = req.body;

    const subject = await Subject.create({
      user: req.user._id,
      name,
      description,
      color: color || '#6366f1',
      examDate: examDate || null,
      icon: icon || '📚',
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/subjects/:id
 * Get a single subject with all its topics
 */
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const topics = await Topic.find({ subject: subject._id }).sort({ order: 1, createdAt: 1 });

    res.json({ success: true, data: { ...subject.toObject(), topics } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/subjects/:id
 * Update a subject
 */
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/subjects/:id
 * Delete a subject and all its topics
 */
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Cascade delete all topics
    await Topic.deleteMany({ subject: req.params.id });

    res.json({ success: true, message: 'Subject and its topics deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSubjects, createSubject, getSubject, updateSubject, deleteSubject };
