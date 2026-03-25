/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: File upload endpoints for profiles and properties
 */

const express = require('express');
const router = express.Router();
const verifyJWT = require('../../middlewares/verifyJWT');
const { uploadProfile, uploadProperty } = require('../../middlewares/upload');
const { uploadProfileImage, uploadPropertyImages } = require('../../controllers/uploadController');

/**
 * @swagger
 * /upload/profile:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (JPEG, PNG, etc.)
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Bad request - No file provided or invalid file type
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
 *       413:
 *         description: Payload Too Large - File size exceeds limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/profile', verifyJWT, uploadProfile.single('image'), uploadProfileImage);

/**
 * @swagger
 * /upload/property:
 *   post:
 *     summary: Upload property images
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of property image files (JPEG, PNG, etc.)
 *                 maxItems: 20
 *     responses:
 *       200:
 *         description: Property images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Images uploaded successfully"
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["https://res.cloudinary.com/image1.jpg", "https://res.cloudinary.com/image2.jpg"]
 *                 public_ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["property/image1", "property/image2"]
 *       400:
 *         description: Bad request - No files provided or invalid file types
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
 *       413:
 *         description: Payload Too Large - File size exceeds limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/property', verifyJWT, uploadProperty.array('images', 20), uploadPropertyImages);

module.exports = router;