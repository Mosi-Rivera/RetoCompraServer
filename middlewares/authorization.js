const jwt = require('jsonwebtoken');
const User = require("../models/user")
const { generateAccessToken, generateRefreshToken, msLifetimeRefreshToken, msLifetimeAccessToken } = require("../utils/jwt")



module.exports.authenticateToken = async (req, res, next) => {
    const { token, refreshToken } = req.cookies;
    try {
        if (!token) {
            throw new Error("No token provided.");
        }
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userEmail = payload.email;
        req.email = userEmail;
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

            // we might use it this way to pass the role as well in the future
            // const payload = {
            //     "email": user.email,
            // "role":user.role
            // }
            const newAccessToken = generateAccessToken(payload)
            const newRefreshToken = generateRefreshToken(payload)


            res.cookie("token", newAccessToken, {
                httpOnly: true,
                maxAge: msLifetimeAccessToken,
                secure: false,
                signed: false
            })

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                maxAge: msLifetimeRefreshToken,
                secure: false,
                signed: false
            })

            const expirationDate = new Date(Date.now() + msLifetimeRefreshToken);
            user.refreshTokens = user.refreshTokens.filter(({ token }) => token !== refreshToken);
            user.refreshTokens.push({ token: newRefreshToken, expiration: expirationDate });
            await user.save();
            req.email = email;
            return next();
        } catch (error) {
            res.sendStatus(401) && next(error);
        }
    }
}
