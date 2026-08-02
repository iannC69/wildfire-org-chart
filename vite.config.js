import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function autoSavePlugin() {
  return {
    name: 'auto-save',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-disk' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              
              if (data.roleDetails) {
                const roleDetailsPath = path.resolve('./src/data/roleDetails.json')
                fs.writeFileSync(roleDetailsPath, JSON.stringify(data.roleDetails, null, 2))
              }
              
              if (data.tree && data.rolesData && data.roles) {
                const staffDataPath = path.resolve('./src/data/staffData.js')
                const staffDataContent = `// ─── ROLE DEFINITIONS ────────────────────────────────────────────────────────\n` +
                  `export const ROLES = ${JSON.stringify(data.roles, null, 2)}\n\n` +
                  `// ─── INITIAL STAFF DATA ───────────────────────────────────────────────────────\n` +
                  `export const INITIAL_ROLES_DATA = ${JSON.stringify(data.rolesData, null, 2)}\n\n` +
                  `// ─── FULL ORGANIZATION TREE ───────────────────────────────────────────────────\n` +
                  `export const ORG_TREE = ${JSON.stringify(data.tree, null, 2)}\n`
                
                fs.writeFileSync(staffDataPath, staffDataContent)
              }

              res.statusCode = 200
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              console.error('Save failed:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), autoSavePlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/steam-profile': {
        target: 'https://steamcommunity.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-profile/, '')
      },
      '/steam-api': {
        target: 'https://api.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/steam-api/, '')
      }
    }
  },
})
