require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket');
const { startAttendanceScheduler } = require('./src/jobs/attendanceScheduler');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const httpServer = http.createServer(app);
  const io = initSocket(httpServer);
  app.set('io', io);

  startAttendanceScheduler();

  httpServer.listen(PORT, () => {
    console.log(`\nGuard Management Backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server, DB connection failed:', err.message);
  process.exit(1);
});
