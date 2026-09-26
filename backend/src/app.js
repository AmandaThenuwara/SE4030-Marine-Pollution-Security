const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const apiRoutes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerSpec } = require("./config/swagger");
const mongoSanitize = require("./middleware/mongoSanitize.middleware");
const { sanitizeInputs } = require("./middleware/sanitize.middleware");

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    xFrameOptions: { action: "deny" },
    noSniff: true,
  })
);

// Strict CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation"), false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(mongoSanitize);
app.use(sanitizeInputs);

// Serve uploaded files securely
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), uploadDir), {
    setHeaders: (res, filePath) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      const ext = path.extname(filePath).toLowerCase();
      if ([".html", ".htm", ".svg", ".xml", ".pdf"].includes(ext)) {
        res.setHeader("Content-Disposition", "attachment");
      }
    },
  })
);

// Swagger docs restricted in production
if (process.env.NODE_ENV !== "production" || process.env.ENABLE_SWAGGER === "true") {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Root test route
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 🚀");
});

// API routes prefix
app.use("/api", apiRoutes);

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;