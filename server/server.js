// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const admin = require("firebase-admin");
const writeDiaryRoute = require("./api/write-diary");


dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, "service-account.json")
  ),
});

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/api/write-diary", writeDiaryRoute);


app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

app.listen(PORT, () =>
    console.log(`✅ Server running on http://localhost:${PORT}`)
  );
  