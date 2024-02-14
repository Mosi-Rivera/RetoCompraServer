const jwt = require('jsonwebtoken');
module.exports.authenticate = async (req, res, next) => {
    const {token, refreshToken} = req.cookies;
    try {
        const {userEmail: email} = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.email = email;
        next()
    } catch (error) {
        try {

            const {userEmail: email} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            req.email = email;
            next();
        } catch (error) {
            res.sendStatus(401) && next(error);
        }
    }
}
