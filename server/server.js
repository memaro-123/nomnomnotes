// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const diaryRoutes = require("./api/diaryRoutes");
const userRoutes = require('./api/userRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api/diary", diaryRoutes);
app.use('/api/user', userRoutes);


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.post('/login', (req, res) => { 
  const { email, password } = req.body
  res.json("recieved")
})
app.post('/register', (req, res) => { //need to do server bullshit
  const { email, password } = req.body// 
  res.json("registered")
})

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );

  