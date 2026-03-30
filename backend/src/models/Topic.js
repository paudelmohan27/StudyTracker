const mongoose = require('mongoose');

/**
 * Topic schema – represents a unit of study within a subject
 */
const topicSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      default: 'NOT_STARTED',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-sync status based on progress value
topicSchema.pre('save', function (next) {
  if (this.isModified('progress')) {
    if (this.progress === 0) this.status = 'NOT_STARTED';
    else if (this.progress === 100) this.status = 'COMPLETED';
    else this.status = 'IN_PROGRESS';
  }
  // Sync progress based on status changes
  if (this.isModified('status') && !this.isModified('progress')) {
    if (this.status === 'NOT_STARTED') this.progress = 0;
    else if (this.status === 'COMPLETED') this.progress = 100;
  }
  next();
});

module.exports = mongoose.model('Topic', topicSchema);
