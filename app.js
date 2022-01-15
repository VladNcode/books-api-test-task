const express = require('express');
// const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const bookRouter = require('./routes/bookRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//* Set security HTTP headers
app.use(helmet());

//* Development logging
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

//* Limit requests from same IP
const limiter = rateLimit({
  max: 100, // requests from the same ip
  windowMs: 60 * 60 * 1000, // 1
  message: 'Too many requests from this ip, please try again in an hour!',
});
app.use('/api/', limiter);

//* Body parser, reading from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//* Data sanitization againts NoSQL query injection
app.use(mongoSanitize());

//* Data sanitization againts XSS
app.use(xss());

app.use('/', (req, res) => {
  res.status(200).json({
    message: 'You can check documentation to work with this app',
    link: 'https://documenter.getpostman.com/view/17965363/UVXjKbtn',
  });
});
app.use('/api/v1/books', bookRouter);
app.use('/api/v1/users', userRouter);

//* If code reaches this point, it will be executed
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
