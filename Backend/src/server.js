import http from 'http'
import { Server } from 'socket.io'
import app from './app.js'
import { connectDatabase } from './config/db.js'
import { env } from './config/env.js'
import { registerSocketServer } from './sockets/index.js'
import net from 'net'

const getPort = (startPort = 5000) => {
  return new Promise((resolve) => {
    const server = net.createServer()
    let port = startPort

    const tryPort = () => {
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE' && port < startPort + 10) {
          port++
          tryPort()
        } else {
          server.close()
          resolve(port)
        }
      })

      server.listen(port, () => {
        server.once('close', () => {})
        server.close()
        resolve(port)
      })
    }

    tryPort()
  })
}

const startServer = async () => {
  await connectDatabase()

  const port = await getPort()
  process.env.PORT = port.toString()
  env.port = port // Update env for consistency

  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: env.nodeEnv === 'development' ? '*' : env.clientUrl,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  registerSocketServer(io)

  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Health check: http://localhost:${port}/api/health`)
    console.log(`Docs: http://localhost:${port}/api-docs`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
