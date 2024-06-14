import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHander from './app/controllers/error.controller.js';
import appointmentRouter from './app/routes/appointment.route.js';
import blogRouter from './app/routes/blog.route.js';
import commentRouter from './app/routes/comment.route.js';
import doctorRouter from './app/routes/doctor.route.js';
import hospitalRouter from './app/routes/hospital.route.js';
import noticeRouter from './app/routes/notice.route.js';
import overviewRouter from './app/routes/overview.route.js';
import userRouter from './app/routes/user.route.js';
import config from './config/index.js';
import AppError from './utils/appError.js';

const app = express();

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Setup session middleware
app.use(session({
  secret: 'your_secret_key', // Change this to a strong, secure key
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/hospitals', hospitalRouter);
app.use('/api/v1/doctors', doctorRouter);
app.use('/api/v1/appointments', appointmentRouter);
app.use('/api/v1/notices', noticeRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/overview', overviewRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the API! 🚀',
  });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHander);

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);

  server.close(() => {
    process.exit(1);
  });
});

export default app;
