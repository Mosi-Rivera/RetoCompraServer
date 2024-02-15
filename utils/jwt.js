const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_LIFETIME = 1000 * 60 * 15;
const REFRESH_TOKEN_LIFETIME = 1000 * 60 * 60 * 24;

module.exports.generateTokenSet = (email, role) => {
    const token = jwt.sign({email, role}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_LIFETIME});
    const refreshToken = jwt.sign({email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: REFRESH_TOKEN_LIFETIME});
    return [token, refreshToken];
}

module.exports.accessTokenLifetime = ACCESS_TOKEN_LIFETIME;
module.exports.refreshTokenLifetime = REFRESH_TOKEN_LIFETIME;
