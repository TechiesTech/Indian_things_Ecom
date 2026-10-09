const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security & Parsers
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
// Express 5 compat: req.query is a getter, so we sanitize objects in-place instead of reassigning
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach(k => {
    if (req[k]) mongoSanitize.sanitize(req[k]);
  });
  next();
});

// Morgan logs the request (automatic)
app.use(morgan('dev'));

// Swagger UI - API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes & Rate Limiting (prevent brute force)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts.' } });
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/users', userRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Indian Things API is running...');
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
