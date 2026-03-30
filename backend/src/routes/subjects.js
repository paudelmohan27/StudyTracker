const express = require('express');
const { body } = require('express-validator');
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { createTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

const subjectValidation = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
];

router.get('/', getSubjects);
router.post('/', subjectValidation, createSubject);
router.get('/:id', getSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

// Nested route: add a topic to a subject
router.post('/:subjectId/topics', [
  body('title').trim().notEmpty().withMessage('Topic title is required'),
], createTopic);

module.exports = router;
