const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate API',
      version: '1.0.0',
      description: 'A comprehensive real estate management API with authentication, property listings, reviews, and favorites',
      contact: {
        name: 'API Support',
        email: 'support@realestate.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com' 
          : `http://localhost:${process.env.PORT || 3500}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Use the token from the login response or refresh endpoint to access protected routes.'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j1' },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            location: { type: 'string', example: 'New York, USA' },
            role: { 
              type: 'string', 
              enum: ['user', 'agent'],
              example: 'user'
            },
            profileImage: { 
              type: 'string', 
              example: 'https://res.cloudinary.com/dqob0m4aw/image/upload/v1234567890/profile.jpg'
            },
            isEmailVerified: { type: 'boolean', example: true },
            licenseNumber: { type: 'string', example: 'RE123456' },
            licenseState: { type: 'string', example: 'NY' },
            brokerage: { type: 'string', example: 'RE/MAX' },
            isVerified: { type: 'boolean', example: false },
            averageRating: { type: 'number', example: 4.5 },
            reviewCount: { type: 'number', example: 12 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j2' },
            title: { type: 'string', example: 'Modern Apartment in Downtown' },
            price: { type: 'number', example: 250000 },
            location: { type: 'string', example: 'Downtown, New York' },
            bedrooms: { type: 'number', example: 2 },
            bathrooms: { type: 'number', example: 2 },
            area: { type: 'number', example: 1200 },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://res.cloudinary.com/image1.jpg', 'https://res.cloudinary.com/image2.jpg']
            },
            description: { type: 'string', example: 'Beautiful modern apartment with great views' },
            type: { 
              type: 'string', 
              enum: ['sale', 'rent'],
              example: 'sale'
            },
            listingType: { 
              type: 'string', 
              enum: ['fsbo', 'agent'],
              example: 'agent'
            },
            listedBy: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j1'
            },
            isShowcase: { type: 'boolean', example: false },
            status: { 
              type: 'string', 
              enum: ['active', 'sold', 'rented', 'pending'],
              example: 'active'
            },
            averageRating: { type: 'number', example: 4.2 },
            reviewCount: { type: 'number', example: 8 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j3' },
            rating: { 
              type: 'number', 
              minimum: 1,
              maximum: 5,
              example: 4
            },
            comment: { type: 'string', example: 'Great property, excellent location!' },
            reviewer: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j1'
            },
            property: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j2',
              nullable: true
            },
            agent: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j4',
              nullable: true
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64f1a2b3c4d5e6f7g8h9i0j5' },
            user: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j1'
            },
            property: { 
              type: 'string', 
              example: '64f1a2b3c4d5e6f7g8h9i0j2'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
            error: { type: 'string', example: 'Detailed error information' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        },
        UploadResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'File uploaded successfully' },
            url: { type: 'string', example: 'https://res.cloudinary.com/dqob0m4aw/image/upload/v1234567890/image.jpg' },
            public_id: { type: 'string', example: 'folder/image_public_id' }
          }
        }
      }
    }
  },
  apis: [
    './routes/*.js',
    './routes/**/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
