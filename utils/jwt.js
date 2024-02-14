const jwt = require("jsonwebtoken");

module.exports.generateAccessToken = function (userEmail) {
    return jwt.sign({ email: userEmail }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
}
module.exports.generateRefreshToken = function (userEmail) {
    return jwt.sign({ email: userEmail }, process.env.REFRESH_TOKEN_SECRET)
}

