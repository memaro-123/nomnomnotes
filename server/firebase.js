const path = require("path");
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(
      path.join(__dirname, "service-account.json")
    ),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, auth, db }