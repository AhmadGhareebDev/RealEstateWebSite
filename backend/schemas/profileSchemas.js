const { z } = require('zod');

const updateProfileSchema = z.object({
  username:  z.string().min(3).max(30).trim().optional(),
  phone:     z.string().min(8).max(20).optional(),
  location:  z.string().min(2).trim().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "No fields provided to update"
});

module.exports = { updateProfileSchema };