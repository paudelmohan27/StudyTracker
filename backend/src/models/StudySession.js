const mongoose = require('mongoose');

/**
 * StudySession schema – tracks individual study blocks for analytics
 */
const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['FOCUS', 'MANUAL'],
      default: 'FOCUS',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudySession', studySessionSchema);
