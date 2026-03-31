require('dotenv').config();
const express = require("express");
const PORT = process.env.PORT || 3500;
const cookieParser = require('cookie-parser');
const connectDataBase = require('./configs/DBconnection');
const { default: mongoose } = require('mongoose');
const errorLogger = require('./middlewares/errorLogger');
const { logger } = require('./middlewares/logevents');
const limiter = require('./middlewares/rateLimiter');
const helmet = require('helmet');
const cors = require('cors');
const corsOptions = require('./configs/corsOptions');
const { swaggerUi, specs } = require('./swagger');
const app = express();

connectDataBase();
app.use(helmet());
app.use(cors(corsOptions));
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', limiter);
app.use('/api/listings', limiter);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/user/property'));
app.use('/api/agents', require('./routes/agents'));

// Legacy routes
app.use('/user', require('./routes/user/user'));
app.use('/review', require('./routes/user/review'));
app.use('/favorite', require('./routes/user/favorite'));
app.use('/upload', require('./routes/user/upload'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Real Estate API Documentation'
}));

app.use(errorLogger);

mongoose.connection.once('open', () => {
  console.log('connected to the DATABASE');
  app.listen(PORT, () => {
    console.log(`Server is running at Port: ${PORT}`);
  });
});