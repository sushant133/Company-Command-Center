import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { registerSocketServer } from './sockets/index.js';

const startServer = async () => {
  await connectDatabase();

  // Render requires us to use process.env.PORT
  const PORT = process.env.PORT || 5000;

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: env.nodeEnv === 'development' ? '*' : env.clientUrl,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  registerSocketServer(io);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Docs: http://localhost:${PORT}/api-docs`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});