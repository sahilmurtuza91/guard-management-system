const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const GuardProfile = require("../models/GuardProfile");

let ioInstance = null;

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error("Socket auth token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Socket auth failed: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: user=${socket.userId} role=${socket.userRole}`);

    // user room
    socket.join(`user:${socket.userId}`);

    const agencyId = socket.handshake.query?.agencyId;
    if (agencyId) {
      socket.join(`agency:${agencyId}`);
    }

    socket.on('guard:locationUpdate', (payload) => {
      if (payload?.agencyId) {
        io.to(`agency:${payload.agencyId}`).emit('guard:locationUpdate', payload);
      }
      if (payload?.clientId) {
        io.to(`user:${payload.clientId}`).emit('guard:locationUpdate', payload);
      }
      if (payload?.guardProfileId && payload?.latitude && payload?.longitude) {
        GuardProfile.findByIdAndUpdate(payload.guardProfileId, {
          lastKnownLocation: {
            latitude: payload.latitude,
            longitude: payload.longitude,
            updatedAt: new Date(),
          },
        }).catch((error) => console.log('Guard location persist error:', error.message));
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user=${socket.userId}`);
    });
  });

  return io;
};

const emitToUser = (userId, event, data) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, data);
};

const emitToAgency = (agencyId, event, data) => {
  if (!ioInstance) return;
  ioInstance.to(`agency:${agencyId}`).emit(event, data);
};

module.exports = {
  initSocket,
  emitToUser,
  emitToAgency
};