
const express = require('express');
const router = express.Router();
const roleCheck = require('../../middlewares/roleCheck')
const {
  createPropertyReview,
  createAgentReview,
  deleteReview,
  updateReview,
  getPropertyReviews,
  getMyReviews
} = require('../../controllers/reviewController');
const verifyJWT = require('../../middlewares/verifyJWT');
const validate = require('../../middlewares/validate');
const { propertyReviewSchema, agentReviewSchema , updateReviewSchema } = require('../../schemas/reviewSchemas');

router.get('/my', verifyJWT, roleCheck('user', 'agent'), getMyReviews);

router.route('/property/:propertyId')
    .post(verifyJWT , roleCheck('user', 'agent') , validate(propertyReviewSchema) , createPropertyReview )
    .get(getPropertyReviews)

router.route('/agent/:agentId')
    .post(verifyJWT , roleCheck('user', 'agent') , validate(agentReviewSchema) , createAgentReview )

router.route('/:reviewId')
  .patch(verifyJWT, roleCheck('user', 'agent'), validate(updateReviewSchema), updateReview)
  .delete(verifyJWT, roleCheck('user', 'agent'), deleteReview);

module.exports = router;