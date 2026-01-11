import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import connectRedis from './config/redis.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import rateLimiter from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import socketHandler from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN 
      ? process.env.SOCKET_IO_CORS_ORIGIN.split(',')
      : process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:5173', 'http://localhost:3000','https://videohub-pulse.netlify.app'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

connectDB();

connectRedis();

// Trust proxy - required when behind reverse proxy (e.g., Render, Heroku, etc.)
// Set to 1 to trust only the first proxy (more secure than true)
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000','https://videohub-pulse.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', rateLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  socketHandler(socket, io);
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

export { io };
