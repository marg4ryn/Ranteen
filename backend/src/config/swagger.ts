import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ranteen API",
      version: "1.0.0",
      description:
        "API documentation for the Ranteen restaurant rating application",
      contact: {
        name: "Ranteen Team",
        email: "support@ranteen.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.ranteen.com"
            : `http://localhost:${process.env.PORT || 5001}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description: "Session cookie authentication",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            firstName: {
              type: "string",
              description: "User first name",
            },
            lastName: {
              type: "string",
              description: "User last name",
            },
            role: {
              type: "string",
              enum: ["student", "admin"],
              description: "User role",
            },
            googleId: {
              type: "string",
              description: "Google OAuth ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation date",
            },
          },
        },
        Dish: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Dish ID",
            },
            name: {
              type: "string",
              description: "Dish name",
            },
            description: {
              type: "string",
              description: "Dish description",
            },
            category: {
              type: "string",
              enum: ["starter", "main", "dessert", "drink"],
              description: "Dish category",
            },
            allergens: {
              type: "array",
              items: {
                type: "string",
              },
              description: "List of allergens",
            },
            dietaryInfo: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "vegetarian",
                  "vegan",
                  "gluten-free",
                  "dairy-free",
                  "nut-free",
                ],
              },
              description: "Dietary information",
            },
            averageRating: {
              type: "number",
              minimum: 0,
              maximum: 5,
              description: "Average rating of the dish",
            },
            totalRatings: {
              type: "number",
              description: "Total number of ratings",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Dish creation date",
            },
          },
        },
        Menu: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Menu ID",
            },
            date: {
              type: "string",
              format: "date",
              description: "Menu date",
            },
            dishes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Dish",
              },
              description: "List of dishes in the menu",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Menu creation date",
            },
          },
        },
        Rating: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Rating ID",
            },
            user: {
              type: "string",
              description: "User ID who gave the rating",
            },
            dish: {
              type: "string",
              description: "Dish ID being rated",
            },
            rating: {
              type: "number",
              minimum: 1,
              maximum: 5,
              description: "Rating value (1-5)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Rating creation date",
            },
          },
        },
        Comment: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Comment ID",
            },
            user: {
              $ref: "#/components/schemas/User",
              description: "User who made the comment",
            },
            dish: {
              type: "string",
              description: "Dish ID being commented on",
            },
            content: {
              type: "string",
              description: "Comment content",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Comment creation date",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            error: {
              type: "string",
              description: "Error details",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/models/*.ts"],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Ranteen API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Serve swagger.json
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

export default specs;
