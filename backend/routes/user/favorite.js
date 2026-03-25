/**
 * @swagger
 * tags:
 *   - name: Favorites
 *     description: User favorite properties management
 */

const express = require('express')
const router = express.Router()
const roleCheck = require('../../middlewares/roleCheck')
const verifyJWT = require('../../middlewares/verifyJWT')
const { toggleFavorite , getMyFavorites } = require('../../controllers/favoriteController')


router.route('/toggle/:propertyId')
    /**
     * @swagger
     * /favorite/toggle/{propertyId}:
     *   post:
     *     summary: Toggle a property as favorite/unfavorite
     *     tags: [Favorites]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: propertyId
     *         required: true
     *         schema:
     *           type: string
     *         description: Property ID to toggle favorite status
     *     responses:
     *       200:
     *         description: Property favorite status toggled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Property added to favorites"
     *                 isFavorite:
     *                   type: boolean
     *                   example: true
     *                 favorite:
     *                   $ref: '#/components/schemas/Favorite'
     *       400:
     *         description: Bad request - Invalid property ID
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
    .post(verifyJWT , roleCheck(['user']) , toggleFavorite)

router.route('/my')
    /**
     * @swagger
     * /favorite/my:
     *   get:
     *     summary: Get current user's favorite properties
     *     tags: [Favorites]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Number of favorites per page
     *     responses:
     *       200:
     *         description: User favorites retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 favorites:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       favorite:
     *                         $ref: '#/components/schemas/Favorite'
     *                       property:
     *                         $ref: '#/components/schemas/Property'
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     total:
     *                       type: integer
     *                     pages:
     *                       type: integer
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
     */
    .get(verifyJWT , roleCheck(['user']) , getMyFavorites)

module.exports =  router