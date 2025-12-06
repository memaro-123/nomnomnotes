// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const diaryRoutes = require("./api/diaryRoutes");
const userRoutes = require('./api/userRoutes');
const analyticsRoutes = require('./api/analyticsRoutes');
const wishlistRoutes = require('./api/wishlistRoutes');
const configRoutes = require('./api/configRoutes');

dotenv.config();
const app = express();
// Simple request logger to help debug client requests
app.use((req, res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api/diary", diaryRoutes);
app.use('/api/user', userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/config', configRoutes);


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );

// Global error handler to ensure errors are logged
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
