// backend/src/server.js
import dotenv from 'dotenv'
dotenv.config()

import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { fileURLToPath } from 'url'

import { createApp, registerPostHandlers } from './app.js'
import { mountAssistant } from './assistant.module.js'
import { prisma } from './db.js'
import chatRouter from "./routes/chat.js"
import { initSocket } from './socket.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = createApp()
// NOTE: chat router already mounted under /api/chat in routes/index.js
// app.use("/api/chat", chatRouter)  // ❌ COMMENTED OUT - duplicates /api/chat from apiRouter
// ---------- Assistant ----------
mountAssistant({ app, basePath: '/api/assistant', prisma })
registerPostHandlers(app)

// ---------- Server options ----------
const HTTP_PORT  = Number(process.env.PORT || 4000)
const HTTPS_ON   = String(process.env.HTTPS || '').toLowerCase() === '1'
const CERT_PATH  = process.env.HTTPS_CERT || process.env.HTTPS_CERT_PATH
const KEY_PATH   = process.env.HTTPS_KEY || process.env.HTTPS_KEY_PATH

function resolveIfRelative(p) {
  if (!p) return undefined
  // ถ้าเป็น path relative ให้ยึดจากโฟลเดอร์ backend/src/.. = backend/
  return path.isAbsolute(p) ? p : path.join(__dirname, '..', p)
}

if (HTTPS_ON) {
  const certFile = resolveIfRelative(CERT_PATH)
  const keyFile  = resolveIfRelative(KEY_PATH)
  try {
    if (!certFile || !keyFile) throw new Error('HTTPS enabled but missing cert/key')
    const cert = fs.readFileSync(certFile)
    const key  = fs.readFileSync(keyFile)

    const httpsPort = Number(process.env.HTTPS_PORT || 4001)
    const server = https.createServer({ key, cert }, app)

    // ✅ attach socket.io
    initSocket(server)

    server.listen(httpsPort, () => {
      console.log(`[Assistant] mounted at /api/assistant`)
      console.log(`HTTPS listening on https://localhost:${httpsPort}`)
    })
  } catch (e) {
    console.error('HTTPS failed to start:', e.message)
    console.error('Falling back to HTTP...')
    const server = http.createServer(app)
    initSocket(server) // ✅ attach socket.io ให้กรณี HTTP ด้วย
    server.listen(HTTP_PORT, () => {
      console.log(`[Assistant] mounted at /api/assistant`)
      console.log(`HTTP listening on http://localhost:${HTTP_PORT}`)
    })
  }
} else {
  const server = http.createServer(app)
  initSocket(server) // ✅
  server.listen(HTTP_PORT, () => {
    console.log(`[Assistant] mounted at /api/assistant`)
    console.log(`HTTP listening on http://localhost:${HTTP_PORT}`)
  })
}


// INSERT INTO "User"("id","username","year","major")
// VALUES
// ('student-123','alice',1,'IT')
// ON CONFLICT ("id") DO NOTHING;
