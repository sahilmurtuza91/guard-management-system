const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/authRoutes');
const guardRoutes = require('./routes/guardRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev')); 
}

app.use(`/${process.env.UPLOAD_DIR || 'uploads'}`, express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Guard Management Backend is running' });
});

app.use('/api/auth', authRoutes);   // all three apps - login/signup/otp
app.use('/api/guard', guardRoutes);   // Guard App
app.use('/api/agency', agencyRoutes); // Agency App
app.use('/api/user', userRoutes);   // User App


app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
