const { z } = require('zod');

const createPropertySchema = z.object({
  title:       z.string().min(5).max(100).trim(),
  price:       z.string().transform(val => Number(val)).pipe(z.number().positive().max(999999999)),
  location:    z.string().min(3).trim(),
  bedrooms:    z.string().transform(val => Number(val)).pipe(z.number().int().min(0).max(50)),
  bathrooms:   z.string().transform(val => Number(val)).pipe(z.number().int().min(1).max(50)),
  area:        z.string().transform(val => Number(val)).pipe(z.number().positive().max(999999)),
  description: z.string().min(30).max(5000).trim(),
  type:        z.enum(['sale', 'rent']),
  listingType: z.enum(['fsbo', 'agent']),
  isShowcase:  z.string().transform(val => val === 'true').pipe(z.boolean()).optional()
});

const updatePropertySchema = z.object({
  title:       z.string().min(5).max(100).trim().optional(),
  price:       z.number().positive().max(999999999).optional(),
  location:    z.string().min(3).trim().optional(),
  bedrooms:    z.number().int().min(0).max(50).optional(),
  bathrooms:   z.number().int().min(1).max(50).optional(),
  area:        z.number().positive().max(999999).optional(),
  description: z.string().min(30).max(5000).trim().optional(),
  type:        z.enum(['sale', 'rent']).optional(),
  images:      z.array(z.string().url()).max(20).optional(),
  listingType: z.enum(['fsbo', 'agent']).optional(),
  isShowcase:  z.boolean().optional(),
  status:      z.enum(['active', 'sold', 'rented', 'pending']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

const contactListingSchema = z.object({
  name:    z.string().max(100).trim().optional(),
  email:   z.string().trim().optional(),
  phone:   z.string().trim().optional(),
  message: z.string().max(2000).trim().optional()
});

module.exports = { createPropertySchema, updatePropertySchema, contactListingSchema };