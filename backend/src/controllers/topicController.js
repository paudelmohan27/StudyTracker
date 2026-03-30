const { validationResult } = require('express-validator');
const Topic = require('../models/Topic');
const Subject = require('../models/Subject');

/**
 * POST /api/subjects/:subjectId/topics
 * Add a topic to a subject
 */
const createTopic = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ensure the subject belongs to this user
    const subject = await Subject.findOne({ _id: req.params.subjectId, user: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const { title, description, status, progress } = req.body;

    // Get the current max order for this subject to append at the end
    const count = await Topic.countDocuments({ subject: subject._id });

    const topic = await Topic.create({
      subject: subject._id,
      user: req.user._id,
      title,
      description: description || '',
      status: status || 'NOT_STARTED',
      progress: progress || 0,
      order: count,
    });

    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/topics/:id
 * Update a topic's status/progress/title
 */
const updateTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/topics/:id
 * Delete a topic
 */
const deleteTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }
    res.json({ success: true, message: 'Topic deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTopic, updateTopic, deleteTopic };
