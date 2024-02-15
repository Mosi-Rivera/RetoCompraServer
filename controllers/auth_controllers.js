const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateTokenSet, accessTokenLifetime, refreshTokenLifetime } = require('../utils/jwt');
const { compareHash, hashPassword, validatePassword, validateEmail } = require('../utils/auth');

module.exports.registerController = async (req, res) => {
    try {
        const {email, password, firstName, lastName} = req.body;
        if (!validatePassword(password) || !validateEmail(email)) {
            return res.sendStatus(500)
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        const [accessToken, refreshToken] = generateTokenSet(email, user.role);

        res.cookie('token', accessToken, {
            httpOnly: true,
            maxAge: accessTokenLifetime
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: refreshTokenLifetime
        });

        await User.findByIdAndUpdate(user._id, {
            $push: {
                refreshTokens: {
                    token: refreshToken,
                    expiration: new Date(Date.now() + refreshTokenLifetime)
                }
            }
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.lastName,
                role: user.role,
                _id: user._id
            }
        });
    }
    catch (err) {
        res.sendStatus(500);
    }
}

module.exports.loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body
        const oldRefreshToken = req.body.refreshToken;

        if (!password || !email) {
            return res.status(500).json({ message: "Invalid Credentials" })
        }

        let user = await User.findOne({ email })

        if (!user) {
            return res.status(500).json({ error: "Invalid Credentials" });
        }

        const validPassword = await compareHash(password, user.password);

        if (!validPassword) {
            return res.status(500).json({ error: "Invalid Credentials" });
        }

        const [accessToken, refreshToken] = generateTokenSet(email, user.role);

        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: accessTokenLifetime,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: refreshTokenLifetime,
        });

        user.refreshTokens = user.refreshTokens.filter(({token}) => token !== oldRefreshToken);
        user.refreshTokens.push({token: refreshToken, expiration: Date.now() + refreshTokenLifetime});
        await user.save();

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                _id: user._id
            }
        });
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.whoAmIController = async (req, res, next) => {
    try {
        const email = req.email;
        const user = await User.findOne({email});
        if (!user) {
            throw new Error("Err: User not found!");
        }
        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.logoutController = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        res.clearCookie("token", {httpOnly: true});
        if (refreshToken) {
            const {email} = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findOneAndUpdate({email}, {$pull: {refreshTokens: {token: refreshToken}}});
            res.clearCookie("refreshToken", {httpOnly: true});
        } 
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(err);
    }
}
