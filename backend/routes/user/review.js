/**
 * @swagger
 * components:
 *   schemas:
 *     PropertyReviewRequest:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           example: "Great property with excellent location!"
 *     AgentReviewRequest:
 *       type: object
 *       required:
 *         - rating
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           example: "Very professional agent, helped me find the perfect home!"
 *     UpdateReviewRequest:
 *       type: object
 *       properties:
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           example: 3
 *         comment:
 *           type: string
 *           maxLength: 1000
 *           example: "Updated review comment"
 */

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
    /**
     * @swagger
     * /review/property/{propertyId}:
     *   post:
     *     summary: Create a review for a property
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: propertyId
     *         required: true
     *         schema:
     *           type: string
     *         description: Property ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PropertyReviewRequest'
     *     responses:
     *       201:
     *         description: Property review created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 review:
     *                   $ref: '#/components/schemas/Review'
     *       400:
     *         description: Bad request - validation error or already reviewed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized - No token provided
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Forbidden - User role required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Property not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    .post(verifyJWT , roleCheck('user', 'agent') , validate(propertyReviewSchema) , createPropertyReview )
    /**
     * @swagger
     * /review/property/{propertyId}:
     *   get:
     *     summary: Get reviews for a property
     *     tags: [Reviews]
     *     parameters:
     *       - in: path
     *         name: propertyId
     *         required: true
     *         schema:
     *           type: string
     *         description: Property ID
     *     responses:
     *       200:
     *         description: Reviews retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Review'
     */
    .get(getPropertyReviews)

router.route('/agent/:agentId')
    /**
     * @swagger
     * /review/agent/{agentId}:
     *   post:
     *     summary: Create a review for an agent
     *     tags: [Reviews]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: agentId
     *         required: true
     *         schema:
     *           type: string
     *         description: Agent ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AgentReviewRequest'
     *     responses:
     *       201:
     *         description: Agent review created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 review:
     *                   $ref: '#/components/schemas/Review'
     *       400:
     *         description: Bad request - validation error or already reviewed
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       401:
     *         description: Unauthorized - No token provided
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       403:
     *         description: Forbidden - User role required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: Agent not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    .post(verifyJWT , roleCheck('user', 'agent') , validate(agentReviewSchema) , createAgentReview )


router.route('/:reviewId')
  /**
   * @swagger
   * /review/{reviewId}:
   *   patch:
   *     summary: Update a review
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *         description: Review ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateReviewRequest'
   *     responses:
   *       200:
   *         description: Review updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   *       400:
   *         description: Bad request - validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Unauthorized - No token provided
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Not review owner
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Review not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  .patch(verifyJWT, roleCheck('user', 'agent'), validate(updateReviewSchema), updateReview)
  
  /**
   * @swagger
   * /review/{reviewId}:
   *   delete:
   *     summary: Delete a review
   *     tags: [Reviews]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: reviewId
   *         required: true
   *         schema:
   *           type: string
   *         description: Review ID
   *     responses:
   *       200:
   *         description: Review deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Success'
   *       401:
   *         description: Unauthorized - No token provided
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - Not review owner
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Review not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  .delete(verifyJWT, roleCheck('user', 'agent'), deleteReview);

module.exports = router;