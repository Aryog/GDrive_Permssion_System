import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { fileRoute } from './src/routes/file'
import { permissionRoute } from './src/routes/permission'
import { shareRoute } from './src/routes/share'
import { authRoute } from './src/routes/auth'
// import { serveStatic } from 'hono/bun'

const app = new Hono()

// Add CORS middleware
app.use('*', cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],  // Your frontend URL
    credentials: true,  // Important for cookies/auth
    allowHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

app.use('*', logger())

// Health check route
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    })
})

// Group all API routes under /api
const apiRoutes = app
    .basePath('/api')
    .route('/auth', authRoute)
    .route('/files', fileRoute)
    .route('/permissions', permissionRoute)
    .route('/share', shareRoute)

// app.get("*", serveStatic({ root: "./frontend/dist" }));
// app.get("*", serveStatic({ path: "./frontend/dist/index.html" }));

export default app
export type ApiRoutes = typeof apiRoutes 