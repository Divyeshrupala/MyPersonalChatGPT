import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Import routes and middleware
import { handleChat } from "./routes/chat.js";
import { handleUpload } from "./routes/upload.js";
import { upload, handleUploadError } from "./middleware/upload.js";
import { AI_PROVIDERS } from "./utils/aiProviders.js";

console.log('🚀 Starting Multi-AI Assistant server...');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📁 Setting up middleware...');
console.log(`🌍 Environment: ${isProduction ? 'production' : 'development'}`);
console.log(`🔌 Port: ${port}`);

// Trust proxy for Render deployment
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com", "https://api.groq.com", "https://api.deepseek.com", "https://api.stability.ai", "https://openrouter.ai", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - more lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 200 : 100, // Higher limit for production
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health' || req.path === '/health';
  }
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 30 : 20, // Higher limit for production
  message: {
    error: "Too many chat requests, please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too many chat requests, please slow down."
    });
  }
});

app.use(limiter);
app.use('/api/chat', chatLimiter);
app.use('/api/upload', chatLimiter);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration for custom domain
const allowedOrigins = [
  'https://chat.divyeshrupala.in',
  'https://divyeshrupala.in',
  'http://localhost:3000',
  'http://localhost:10000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins or no origin (direct requests)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Input validation middleware
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Basic XSS protection
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  }
  next();
});

// Health check endpoints for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    message: 'Server is working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: port,
    providers: Object.keys(AI_PROVIDERS)
  });
});

// Get available AI providers
app.get('/api/providers', (req, res) => {
  res.json({ providers: AI_PROVIDERS });
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

console.log('🛣️ Setting up routes...');

// Routes
app.post("/api/upload", upload.single("file"), handleUploadError, handleUpload);
app.post("/api/chat", (req, res, next) => {
  console.log('📨 Chat request received');
  console.log('   Provider:', req.body.provider);
  console.log('   Model:', req.body.model);
  console.log('   Has API Key:', !!req.body.apiKey);
  console.log('   Message length:', req.body.messages?.length || 0);
  next();
}, handleChat);

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error. Please try again later.',
    ...(isProduction ? {} : { details: err.message })
  });
});

console.log('🎧 Starting server listener...');

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🎯 Ready to serve AI requests!');
  
  if (isProduction) {
    console.log('🌐 Production mode: Server accessible from all interfaces');
    console.log(`🔗 Access at: ${process.env.APP_URL || 'https://chat.divyeshrupala.in'}`);
  } else {
    console.log(`🔗 Local access: http://localhost:${port}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (isProduction) {
    // In production, try to gracefully shutdown
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    // In production, log but don't exit
    console.error('🔄 Continuing in production mode...');
  } else {
    process.exit(1);
  }
});