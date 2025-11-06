const { auth } = require("../../firebase.js");

async function verifyUser(req) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) { 
        throw new Error("Missing or invalid authorization header")
    }

    const token = authHeader.split(" ")[1];
    const decoded = await auth.verifyIdToken(token);
    console.log('decoded uid:', decoded)
    return decoded;
}

module.exports = { verifyUser };