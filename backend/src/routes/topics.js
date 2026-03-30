const express = require('express');
const { updateTopic, deleteTopic } = require('../controllers/topicController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

module.exports = router;
