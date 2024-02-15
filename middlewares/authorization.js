const jwt = require('jsonwebtoken');
const User = require("../models/user")
const { generateAccessToken, generateRefreshToken, accessTokenLifetime, refreshTokenLifetime } = require("../utils/jwt")

module.exports.authenticateToken = async (req, res, next) => {
    const { token, refreshToken } = req.cookies;
    try {
        if (!token) {
            throw new Error("No token provided.");
        }
        const {email} = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.email = email;
        return next();
    } catch (error) {
        try {
            if (!refreshToken) {
                throw new Error("Err: No refresh token provided.");
            }
            const { email } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findOne({ email, "refreshTokens.token": refreshToken });

            if (!user) {
                throw new Error("invalid refresh token")
            }
            const payload = user.email;

            const newAccessToken = generateAccessToken(payload)
            const newRefreshToken = generateRefreshToken(payload)


            res.cookie("token", newAccessToken, {
                httpOnly: true,
                maxAge: accessTokenLifetime,
            });
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                maxAge: refreshTokenLifetime,
            });

            const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
            user.refreshTokens = user.refreshTokens.filter(({token}) => token !== refreshToken);
            user.refreshTokens.push({ token: newRefreshToken, expiration: expirationDate });
            await user.save();
            req.email = email;
            return next();
        } catch (error) {
            res.sendStatus(401) && next(error);
        }
    }
};
