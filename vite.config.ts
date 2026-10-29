import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Readable } from 'node:stream'

/**
 * Serves the Vercel edge functions in /api during `npm run dev`,
 * so the AI chat works locally without the Vercel CLI.
 */
function vercelApiInDev(): Plugin {
  return {
    name: 'vercel-api-in-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const name = req.url.slice(5).split('?')[0]
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.ts`)
          const chunks: Buffer[] = []
          for await (const c of req) chunks.push(c as Buffer)
          const request = new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
          })
          const response: Response = await mod.default(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          if (response.body) Readable.fromWeb(response.body as never).pipe(res)
          else res.end()
        } catch (err) {
          server.config.logger.error(String(err))
          res.statusCode = 500
          res.end('API error')
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose server-only secrets (GEMINI_API_KEY) to the dev API handler.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), tailwindcss(), vercelApiInDev()],
  }
})
