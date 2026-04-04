const express = require('express');
const router = express.Router();
const verifyJWT = require('../middlewares/verifyJWT');
const softAuth = require('../middlewares/softAuth');
const roleCheck = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const { agentProfileRatingSchema } = require('../schemas/reviewSchemas');
const { getAgentProfile, getAllAgents, rateAgentProfile } = require('../controllers/agentController');

router.get('/', softAuth, getAllAgents);
router.post('/:agentId/rating', verifyJWT, roleCheck('user', 'agent'), validate(agentProfileRatingSchema), rateAgentProfile);
router.get('/:agentId', softAuth, getAgentProfile);

module.exports = router;
