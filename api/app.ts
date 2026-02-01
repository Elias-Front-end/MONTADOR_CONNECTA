/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'

import fs from 'fs'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

// Serve static files from the frontend build directory
const clientBuildPath = path.join(__dirname, '../../dist')

// Function to serve index.html with runtime env injection
const serveIndexHtml = (res: Response) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html', err);
      return res.status(500).send('Error loading application');
    }

    // Replace the placeholder with actual env vars
    const envConfig = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:8000',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
    };

    const result = data.replace(
      'window.__ENV__ = {',
      `window.__ENV__ = ${JSON.stringify(envConfig)}; //`
    );

    res.send(result);
  });
};

// Serve static files BUT skip index.html so we can handle it manually
app.use(express.static(clientBuildPath, { index: false }))

// Handle root path specifically
app.get('/', (req: Request, res: Response) => {
  serveIndexHtml(res);
});

// Handle SPA routing: serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    // If it's an API route that wasn't handled above, return 404 json
    res.status(404).json({
      success: false,
      error: 'API not found',
    })
  } else {
    serveIndexHtml(res);
  }
})

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
