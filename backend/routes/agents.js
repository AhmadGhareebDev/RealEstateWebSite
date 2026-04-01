const express = require('express');
const router = express.Router();
const { getAgentProfile } = require('../controllers/agentController');

router.get('/:agentId', getAgentProfile);

module.exports = router;
