const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const { errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Morgan logs the request (automatic)
app.use(morgan('dev'));

// Swagger UI - API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Indian Things API is running...');
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
