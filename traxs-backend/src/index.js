require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const driverRoutes = require('./routes/drivers');
const passengerRoutes = require('./routes/passengers');
const inferenceRoutes = require('./routes/inference');
const intelligenceRoutes = require('./routes/intelligence');
const ussdRoutes = require('./routes/ussd');

const driverCtrl = require('./controllers/driverController');
const passengerCtrl = require('./controllers/passengerController');
const { startSnapshotCron } = require('./services/mobilitySnapshot');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // needed for USSD form posts

// Inject io into controllers that need it
driverCtrl.setIo(io);
passengerCtrl.setIo(io);

app.use('/api/drivers', driverRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/inference', inferenceRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/ussd', ussdRoutes);

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'TRAXS backend running' } }));

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    startSnapshotCron(io);
    server.listen(process.env.PORT, () => {
      console.log(`TRAXS backend running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
