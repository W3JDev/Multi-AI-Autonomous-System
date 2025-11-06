import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { appRouter } from '@repo/api/server';
import 'dotenv/config';

const app = express();

// CORS Configuration
const allowedOrigins = [
  'https://dashboard.w3jdev.com',
  'https://punch-clock.w3jdev.com',
  'https://restaurant-ai.w3jdev.com',
  'https://flair-ai.w3jdev.com',
  'https://ai-artisan.w3jdev.com',
  'https://serene-ai.w3jdev.com',
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005',
  'http://localhost:3006',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Info Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'W3JDev AI Ecosystem API Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      trpc: '/trpc',
    },
  });
});

// tRPC Endpoint
app.use('/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: () => ({}),
}));

// Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start HTTP Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway listening on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 tRPC endpoint: http://localhost:${PORT}/trpc`);
});

// WebSocket Server for tRPC Subscriptions
const wss = new WebSocketServer({ 
  port: parseInt(process.env.WS_PORT || '3001'),
  server: server,
});

applyWSSHandler({ 
  wss, 
  router: appRouter,
  createContext: () => ({}),
});

console.log(`🔌 WebSocket server listening on port ${process.env.WS_PORT || '3001'}`);

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    wss.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    wss.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
});
