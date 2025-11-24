// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const diaryRoutes = require("./api/diaryRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api/diary", diaryRoutes);


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
