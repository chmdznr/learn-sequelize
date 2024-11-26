module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Chapter 6 API Documentation',
    version: '1.0.0',
    description: 'API documentation for Chapter 6 - Advanced Model Patterns and Data Validation with Sequelize',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      Article: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          type: { type: 'string', enum: ['article'] },
          metadata: { 
            type: 'object',
            properties: {
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Video: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          type: { type: 'string', enum: ['video'] },
          metadata: { 
            type: 'object',
            properties: {
              duration: { type: 'number' },
              resolution: { type: 'string' }
            }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          price: { type: 'number' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 }
              }
            }
          },
          status: { 
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'cancelled']
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true }
        }
      }
    }
  },
  paths: {
    '/api/content': {
      get: {
        summary: 'Get all content',
        parameters: [
          {
            name: 'includeDeleted',
            in: 'query',
            schema: {
              type: 'boolean'
            },
            description: 'Include soft-deleted content'
          }
        ],
        responses: {
          '200': {
            description: 'List of all content',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    oneOf: [
                      { $ref: '#/components/schemas/Article' },
                      { $ref: '#/components/schemas/Video' }
                    ]
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new content',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  { $ref: '#/components/schemas/Article' },
                  { $ref: '#/components/schemas/Video' }
                ]
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Content created successfully',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/Article' },
                    { $ref: '#/components/schemas/Video' }
                  ]
                }
              }
            }
          }
        }
      }
    },
    '/api/content/{id}': {
      get: {
        summary: 'Get content by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            name: 'includeDeleted',
            in: 'query',
            schema: {
              type: 'boolean'
            },
            description: 'Include soft-deleted content'
          }
        ],
        responses: {
          '200': {
            description: 'Content found',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    { $ref: '#/components/schemas/Article' },
                    { $ref: '#/components/schemas/Video' }
                  ]
                }
              }
            }
          },
          '404': {
            description: 'Content not found'
          }
        }
      }
    },
    '/api/content/type/{type}': {
      get: {
        summary: 'Get content by type',
        parameters: [
          {
            name: 'type',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['article', 'video']
            }
          }
        ],
        responses: {
          '200': {
            description: 'List of content by type',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    oneOf: [
                      { $ref: '#/components/schemas/Article' },
                      { $ref: '#/components/schemas/Video' }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        responses: {
          '200': {
            description: 'List of all products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Product'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Product created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Product found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Product'
                }
              }
            }
          },
          '404': {
            description: 'Product not found'
          }
        }
      }
    },
    '/api/orders': {
      get: {
        summary: 'Get all orders',
        responses: {
          '200': {
            description: 'List of all orders',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Order'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Order'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          }
        }
      }
    },
    '/api/orders/{id}': {
      get: {
        summary: 'Get order by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Order found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          },
          '404': {
            description: 'Order not found'
          }
        }
      }
    },
    '/api/orders/{id}/status': {
      put: {
        summary: 'Update order status',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'processing', 'completed', 'cancelled']
                  }
                },
                required: ['status']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Order status updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Order'
                }
              }
            }
          },
          '404': {
            description: 'Order not found'
          }
        }
      }
    }
  }
};
