import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { fileRoute } from './src/routes/file'
import { permissionRoute } from './src/routes/permission'
import { shareRoute } from './src/routes/share'
import { authRoute } from './src/routes/auth'
// import { serveStatic } from 'hono/bun'

const app = new Hono()

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