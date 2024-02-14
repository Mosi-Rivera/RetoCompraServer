const jwt = require('jsonwebtoken');
const User = require("../models/user")
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt")



module.exports.authenticateToken = async (req, res, next) => {
    const { token, refreshToken } = req.cookies;
    try {
        if (!token) {
            throw new Error("No token provided.");
        }
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userEmail = payload.email;
        console.log(userEmail);
        req.email = userEmail;
        return next();
    } catch (error) {
        try {
            if (!refreshToken) {
                throw new Error("Err: No refresh token provided.");
            }
            const { email } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            console.log(email);
            const user = await User.findOne({ email, "refreshTokens.token": refreshToken });
            if (!user) {
                throw new Error("invalid refresh token")
            }
            const payload = user.email;

            // we might use it this way to pass the role as well in the future
            // const payload = {
            //     "email": user.email
            // }
            const newAccessToken = generateAccessToken(payload)
            console.log(`new access token: ${newAccessToken}`)
            const newRefreshToken = generateRefreshToken(payload)
            console.log(`new access token: ${newRefreshToken}`)


            res.cookie("token", newAccessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                secure: false,
                signed: false
            })

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                secure: false,
                signed: false
            })

            const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
            user.refreshTokens = user.refreshTokens.filter(({token}) => token !== refreshToken);
            user.refreshTokens.push({ token: newRefreshToken, expiration: expirationDate });
            await user.save();
            req.email = email;
            return next();
        } catch (error) {
            console.log(error)
            res.sendStatus(401) && next(error);
        }
    }
}