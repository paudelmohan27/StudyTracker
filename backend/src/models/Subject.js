const mongoose = require('mongoose');

/**
 * Subject schema – each subject belongs to a user and has an exam date
 */
const subjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [100, 'Subject name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1', // Default indigo
    },
    examDate: {
      type: Date,
      default: null,
    },
    icon: {
      type: String,
      default: '📚',
    },
  },
  {
    timestamps: true,
    // Virtual field to get topics (populated separately)
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to populate topics for this subject
subjectSchema.virtual('topics', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'subject',
});

module.exports = mongoose.model('Subject', subjectSchema);
