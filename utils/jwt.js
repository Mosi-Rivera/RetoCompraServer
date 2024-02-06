const jwt = require("jsonwebtoken");

function generateAccessToken(userEmail) {
    return jwt.sign({ userEmail }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}

module.exports = { generateAccessToken };