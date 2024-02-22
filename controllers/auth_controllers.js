const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const schema = new passwordValidator();
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const CryptoJS = require("crypto-js")



schema
    .is().min(5)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()

module.exports.registerController = async (req, res) => {
    try {
        const body = req.body;
        const email = body.email;
        let password = body.password;
        const firstName = body.firstName;
        const lastName = body.lastName;
        password = CryptoJS.AES.decrypt(password, process.env.VITE_KEY).toString(CryptoJS.enc.Utf8);

        if (!schema.validate(password) || !emailValidator.validate(email)) { return res.sendStatus(500) }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const newEmail = user.email

        const token = generateAccessToken(newEmail)
        const refreshToken = generateRefreshToken(newEmail)

        res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 15 })
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 })
        user.refreshTokens.push({
            token: refreshToken, expiration: new Date(
                Date.now() + 1000 * 60 * 60 * 24
            )
        })
        await user.save()

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
        console.log(err);
        res.sendStatus(500);
    }
}

module.exports.loginController = async (req, res) => {
    try {
        const body = req.body;
        const email = body.email;
        let password = body.password;
        const oldRefreshToken = req.body.refreshToken;

        password = CryptoJS.AES.decrypt(password, process.env.VITE_KEY).toString(CryptoJS.enc.Utf8);

        if (!password || !email) {
            return res.status(500).json({ message: "Invalid Credentials" })
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(500).json({ error: "Invalid Credentials" });
        }
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(500).json({ error: "Invalid Credentials" });
        }
        const accessToken = generateAccessToken(email)
        console.log(`first access token: ${accessToken}`)
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: false,
            signed: false
        })

        const refreshToken = generateRefreshToken(email)
        console.log(`first refresh token: ${refreshToken}`)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: false,
            signed: false
        })

        const expirationDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
        if (oldRefreshToken)
            user.refreshTokens = user.refreshTokens.filter(({ token }) => token !== oldRefreshToken);
        user.refreshTokens.push({
            token: refreshToken,
            expiration: expirationDate
        });
        user.save();


        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                _id: user._id
            }
        })
    } catch (error) {
        res.status(500).json({ error: "Invalid Credentials " + error })
    }
}

module.exports.whoAmIController = async (req, res, next) => {
    try {
        const email = req.email;
        const user = await User.findOne({ email });
        console.log(email)
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
        res.clearCookie("token", { httpOnly: true });
        if (refreshToken) {
            const { email } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            console.log(email);
            await User.findOneAndUpdate({ email }, { $pull: { refreshTokens: { token: refreshToken } } });
            res.clearCookie("refreshToken", { httpOnly: true });
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
