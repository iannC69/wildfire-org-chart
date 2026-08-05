import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function autoSavePlugin() {
  return {
    name: 'auto-save',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/api/steam-avatar') && req.method === 'GET') {
          const urlObj = new URL(req.url, `http://${req.headers.host}`)
          const steamUrl = urlObj.searchParams.get('url')
          
          if (!steamUrl) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Missing url parameter' }))
          }

          // Ensure trailing slash before ?xml=1
          const xmlUrl = (steamUrl.endsWith('/') ? steamUrl : steamUrl + '/') + '?xml=1'
          
          fetch(xmlUrl)
            .then(r => r.text())
            .then(xml => {
              const match = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/)
              if (match && match[1]) {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ avatarUrl: match[1] }))
              } else {
                res.statusCode = 404
                res.end(JSON.stringify({ error: 'Avatar not found in XML' }))
              }
            })
            .catch(err => {
              console.error('Steam fetch error:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to fetch steam profile' }))
            })
          return
        }

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
                  `export const ORG_TREE = ${JSON.stringify(data.tree, null, 2)}\n\n` +
                  `// ─── HELPERS ─────────────────────────────────────────────────────────────────\n` +
                  `export function getRoleById(id) {\n` +
                  `  return ROLES.find(r => r.id === id)\n` +
                  `}\n\n` +
                  `export function getInitials(name) {\n` +
                  `  if (!name) return ''\n` +
                  `  return name.split(/[\\s()]+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')\n` +
                  `}\n\n` +
                  `let _nextId = Date.now()\n` +
                  `export function genId() {\n` +
                  `  return \`m\${_nextId++}\`\n` +
                  `}\n`
                
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
    },
    handleHotUpdate({ file }) {
      // Ignore HMR for these files so the app doesn't reload and lose Edit Mode
      if (file.endsWith('staffData.js') || file.endsWith('roleDetails.json')) {
        return []
      }
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
