const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const schema = new passwordValidator();
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken, msLifetimeAccessToken, msLifetimeRefreshToken } = require('../utils/jwt');
const CryptoJS = require("crypto-js");
const { sendVerificationEmail } = require('../utils/mailer');

schema
    .is().min(5)
    .is().max(100)
    .has().uppercase()
    .has().lowercase()
    .has().digits()

module.exports.registerController = async (req, res, next) => {
    try {
        const body = req.body;
        const email = body.email;
        let password = body.password;
        const firstName = body.firstName;
        const lastName = body.lastName;
        password = CryptoJS.AES.decrypt(password, process.env.VITE_KEY).toString(CryptoJS.enc.Utf8);

        if (!schema.validate(password) || !emailValidator.validate(email)) { return res.sendStatus(500) }

        const duplicatedUser = await User.findOne({ email: email })

        if (duplicatedUser) {
            return res.status(400).json({ field: "server", errorMessage: "Oops, something went wrong. Please try again" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            emailVerificationId: crypto.randomBytes(20).toString('hex')
        });

        const user = await newUser.save();

        const newEmail = user.email

        const token = generateAccessToken(newEmail, newUser.role)
        const refreshToken = generateRefreshToken(newEmail)

        res.cookie('token', token, { httpOnly: true, maxAge: msLifetimeAccessToken });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: msLifetimeRefreshToken });
        user.refreshTokens.push({
            token: refreshToken, expiration: new Date(
                Date.now() + msLifetimeRefreshToken
            )
        })
        await user.save()
        sendVerificationEmail(user, process.env.NODE_ENV ?`${req.protocol}://${req.get('host')}` : "http://localhost:5173");

        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.lastName,
                role: user.role,
                _id: user._id,
                cart: user.cart,
                emailVerified: user.emailVerified
            }
        });
    }
    catch (error) {
        res.sendStatus(500) && next(error);

    }
}

module.exports.loginController = async (req, res, next) => {
    try {
        const body = req.body;
        const email = body.email;
        let password = body.password;
        const oldRefreshToken = req.cookies.refreshToken;

        password = CryptoJS.AES.decrypt(password, process.env.VITE_KEY).toString(CryptoJS.enc.Utf8);

        if (!password || !email) {
            return res.status(400).json({ field: "server", errorMessage: "Invalid Credentials" }) && next(new Error(new Error("invalid username/password")));
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ field: "server", errorMessage: "Invalid Credentials" }) && next(new Error('User does not exist.'));
        }
        const validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) {
            return res.status(400).json({ field: "server", errorMessage: "Invalid Credentials" }) && next(new Error('Password does not match.'));
        }
        const accessToken = generateAccessToken(email, user.role)
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: msLifetimeAccessToken,
            secure: false,
            signed: false
        })

        const refreshToken = generateRefreshToken(email)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: msLifetimeRefreshToken,
            secure: false,
            signed: false
        })

        const expirationDate = new Date(Date.now() + msLifetimeRefreshToken);
        if (oldRefreshToken)
        {
            user.refreshTokens = user.refreshTokens.filter(({ token }) => token !== oldRefreshToken);
        }
        user.refreshTokens.push({
            token: refreshToken,
            expiration: expirationDate
        });
        await user.save();


        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                _id: user._id,
                cart: user.cart,
                emailVerified: user.emailVerified
            }
        })
    } catch (error) {
        res.status(500).json({ error: "Invalid Credentials " + error }) && next(error)
    }
}

module.exports.whoAmIController = async (req, res, next) => {
    try {
        const email = req.email;
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Err: User not found!");
        }
        res.status(200).json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                cart: user.cart,
                emailVerified: user.emailVerified
            }
        });
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports.logoutController = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        res.clearCookie("token", { httpOnly: true });
        if (refreshToken) {
            const { email } = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await User.findOneAndUpdate({ email }, { $pull: { refreshTokens: { token: refreshToken } } });
            res.clearCookie("refreshToken", { httpOnly: true });
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.sendEmailVerification = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await User.findOneAndUpdate(
            {email},
            {$set: {emailVerificationId:  crypto.randomBytes(20).toString('hex')}},
            {new: true}
        );
        if (!user) {
            throw new Error('Error: User not found.');
        }
        await sendVerificationEmail(user, process.env.NODE_ENV ?`${req.protocol}://${req.get('host')}` : "http://localhost:5173");
console.log();
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.verifyEmail = async (req, res, next) => {
    try {
        const {userId, validationCode} = req.params;
        const response = await User.updateOne({_id: userId, emailVerified: false, emailVerificationId: validationCode}, {$set: {emailVerified: true}});
        if (response.matchedCount === 0) {
            throw new Error("Error: Invaid user, token or already verified.");
        }
        res.sendStatus(200);

    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
