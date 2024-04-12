const jwt = require("jsonwebtoken");

module.exports.msLifetimeAccessToken = 1000 * 60 * 15;

module.exports.msLifetimeRefreshToken = 1000 * 60 * 60 * 24;

module.exports.generateAccessToken = function (userEmail, userRole) {
    return jwt.sign({ email: userEmail, role: userRole }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: module.exports.msLifetimeAccessToken })
}
module.exports.generateRefreshToken = function (userEmail) {
    return jwt.sign({ email: userEmail }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: module.exports.msLifetimeRefreshToken })
}

