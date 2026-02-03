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
import { createProxyMiddleware } from 'http-proxy-middleware';

import fs from 'fs'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())

// Proxy for Internal Supabase Access
// This allows the frontend to talk to Supabase via this server (acting as a bridge)
// Useful when Supabase is only accessible internally in the Docker network
const internalSupabaseUrl = process.env.INTERNAL_SUPABASE_URL;

if (internalSupabaseUrl) {
  console.log(`Setting up Supabase Proxy to: ${internalSupabaseUrl}`);
  app.use(
    '/api/supabase',
    createProxyMiddleware({
      target: internalSupabaseUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api/supabase': '', // Remove /api/supabase prefix when forwarding
      },
      on: {
        proxyReq: (proxyReq, req, res) => {
           // Explicitly ensure apikey header is passed if present in original request
           if (req.headers['apikey']) {
             proxyReq.setHeader('apikey', req.headers['apikey']);
           }
           if (req.headers['authorization']) {
             proxyReq.setHeader('Authorization', req.headers['authorization']);
           }
           
           // Log for debugging
           // console.log(`[Proxy] ${req.method} ${req.url} -> Header apikey: ${!!req.headers['apikey']}`);
        },
        error: (err, req, res) => {
          console.error('Proxy Error Details:', {
            message: err.message,
            code: (err as any).code,
            address: (err as any).address,
            port: (err as any).port,
            target: internalSupabaseUrl
          });
          if ((res as any).status) {
            (res as any).status(500).json({ error: 'Proxy Error', details: err.message, code: (err as any).code });
          } else {
             res.end('Proxy Error');
          }
        }
      }
    })
  );
}

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
app.use(express.static(clientBuildPath))

// Handle SPA routing: serve index.html for all non-API routes
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    // If it's an API route that wasn't handled above, return 404 json
    res.status(404).json({
      success: false,
      error: 'API not found',
    })
  } else {
    res.sendFile(path.join(clientBuildPath, 'index.html'))
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
