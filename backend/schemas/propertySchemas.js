const { z } = require('zod');

/**
 * Create Property (Listing) Schema
 * ---------------------------------
 * listingType is required: "fsbo" for users, "agent" for agents.
 * isShowcase is optional (only agents can set it to true — enforced in controller).
 * ownerName / ownerPhone removed — contact info comes from the User model
 * and is only returned via POST /api/listings/:id/contact.
 */
const createPropertySchema = z.object({
  title:       z.string().min(5).max(100).trim(),
  price:       z.string().transform(val => Number(val)).pipe(z.number().positive().max(999999999)),
  location:    z.string().min(3).trim(),
  bedrooms:    z.string().transform(val => Number(val)).pipe(z.number().int().min(0).max(50)),
  bathrooms:   z.string().transform(val => Number(val)).pipe(z.number().int().min(1).max(50)),
  area:        z.string().transform(val => Number(val)).pipe(z.number().positive().max(999999)),
  description: z.string().min(20).max(5000).trim(),
  type:        z.enum(['sale', 'rent']),
  listingType: z.enum(['fsbo', 'agent']),
  isShowcase:  z.string().transform(val => val === 'true').pipe(z.boolean()).optional()
});

/**
 * Update Property (Listing) Schema
 * ---------------------------------
 * status replaces isActive for lifecycle tracking.
 * isShowcase can be toggled (only by agents on their own listings — enforced in controller).
 */
const updatePropertySchema = z.object({
  title:       z.string().min(5).max(100).trim().optional(),
  price:       z.number().positive().max(999999999).optional(),
  location:    z.string().min(3).trim().optional(),
  bedrooms:    z.number().int().min(0).max(50).optional(),
  bathrooms:   z.number().int().min(1).max(50).optional(),
  area:        z.number().positive().max(999999).optional(),
  description: z.string().min(20).max(5000).trim().optional(),
  type:        z.enum(['sale', 'rent']).optional(),
  images:      z.array(z.string().url()).max(20).optional(),
  listingType: z.enum(['fsbo', 'agent']).optional(),
  isShowcase:  z.boolean().optional(),
  status:      z.enum(['active', 'sold', 'rented', 'pending']).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

/**
 * Contact Listing Schema
 * POST /api/listings/:id/contact
 * The buyer/inquirer provides their own info and an optional message.
 */
const contactListingSchema = z.object({
  name:    z.string().min(2).max(100).trim(),
  email:   z.email(),
  phone:   z.string().min(8).max(20),
  message: z.string().max(2000).trim().optional()
});

module.exports = { createPropertySchema, updatePropertySchema, contactListingSchema };