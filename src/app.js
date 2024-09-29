const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const path = require('path');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const apiRoutes = require('./routes/api');
const webRoutes = require('./routes/web');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Serve static files from the 'view' directory
app.use(express.static(path.join(__dirname, 'view')));

// Set security HTTP headers
app.use(helmet());

// Parse JSON request body
app.use(express.json());

// Parse URL-encoded request body
app.use(express.urlencoded({ extended: true }));

// Sanitize request data
app.use(xss());
app.use(mongoSanitize());

// Gzip compression
app.use(compression());

// Enable CORS
app.use(cors());
app.options('*', cors());

// JWT authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/api/auth', authLimiter);
}

// Content Security Policy settings
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'code.jquery.com', '*.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", '*.cloudflare.com', '*.googleapis.com', '*.jsdelivr.net'],
      fontSrc: ["'self'", '*.gstatic.com', '*.cloudflare.com', '*.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
    },
  })
);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'auth', 'login.html')); // Serve login.html
});

// Login route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'auth', 'login.html')); // Serve login.html
});

// Registration route
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'auth', 'register.html')); // Serve register.html
});

// API routes
app.use('/api', apiRoutes);

// Web routes
app.use('/web', webRoutes);

// Handle favicon requests with a 204 No Content response if no favicon is available
app.get('/favicon.ico', (req, res) => res.status(204));

// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;
