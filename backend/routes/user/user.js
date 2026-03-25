/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           example: john_doe_updated
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         location:
 *           type: string
 *           example: "New York, USA"
 */

const express = require('express')
const router = express.Router()
const verifyJWT = require('../../middlewares/verifyJWT')
const { getMyProfile , deleteMyAccount , updateMyProfile  } = require('../../controllers/accountController')
const { updateProfileSchema } = require('../../schemas/profileSchemas')
const validate = require('../../middlewares/validate')
router.route('/me')
    /**
     * @swagger
     * /user/me:
     *   get:
     *     summary: Get current user profile
     *     tags: [User Management]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Unauthorized - No token provided
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    .get(verifyJWT , getMyProfile)
    
    /**
     * @swagger
     * /user/me:
     *   delete:
     *     summary: Delete current user account
     *     tags: [User Management]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Account deleted successfully
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
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    .delete(verifyJWT , deleteMyAccount)
    
    /**
     * @swagger
     * /user/me:
     *   put:
     *     summary: Update current user profile
     *     tags: [User Management]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateProfileRequest'
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 user:
     *                   $ref: '#/components/schemas/User'
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
     *       404:
     *         description: User not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    .put(verifyJWT, validate(updateProfileSchema) , updateMyProfile)


module.exports = router