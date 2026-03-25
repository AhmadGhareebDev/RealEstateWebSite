const express = require('express');
const router = express.Router();
const { getAgentProfile } = require('../controllers/agentController');

// Public agent profile
router.get('/:agentId', getAgentProfile);

module.exports = router;
