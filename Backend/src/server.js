import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { registerSocketServer } from './sockets/index.js'

const startServer = async () => {
  await connectDatabase()

  const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: env.nodeEnv === 'development' ? '*' : env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST'],
  },
})

registerSocketServer(io)

server.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`)
})
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
