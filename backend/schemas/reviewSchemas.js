const { z } = require('zod');

const propertyReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

const agentReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field (rating or comment) must be provided"
});

module.exports = { propertyReviewSchema, agentReviewSchema , updateReviewSchema };