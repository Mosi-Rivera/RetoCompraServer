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
const { generateEmailVerificationCode } = require('../utils/codeGeneration');

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
            emailVerificationCode: {
                code: generateEmailVerificationCode(),
                createdAt: new Date()
            }
        });

        const user = await newUser.save();

        const newEmail = user.email

        const token = generateAccessToken(newEmail, newUser.role, newUser.emailVerified);
        const refreshToken = generateRefreshToken(newEmail);

        res.cookie('token', token, { httpOnly: true, maxAge: msLifetimeAccessToken });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: msLifetimeRefreshToken });
        await user.replaceRefreshToken(refreshToken);

        await sendVerificationEmail(user, user.emailVerificationCode.code);
        

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
        const accessToken = generateAccessToken(email, user.role, user.emailVerified);
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: msLifetimeAccessToken,
            secure: false,
            signed: false
        })

        const refreshToken = generateRefreshToken(email);
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: msLifetimeRefreshToken,
            secure: false,
            signed: false
        })

        await user.replaceRefreshToken(refreshToken, oldRefreshToken);

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
        const email = req.email;
        const user = await User.newEmailVerificationCode(email);
        if (!user) {
            throw new Error('Error: User not found.');
        }
        await sendVerificationEmail(user, user.emailVerificationCode.code);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.verifyEmail = async (req, res, next) => {
    try {
        const {verificationCode} = req.body;
        const oldRefreshToken = req.cookies.refreshToken;
        const email = req.email;
        const user = await User.findOneAndUpdate({
            email, 
            emailVerified: false, 
            'emailVerificationCode.code': verificationCode,
            'emailVerificationCode.createdAt': {$gte: new Date(Date.now() - 1000 * 60 * 5)}
        },
            {
                $set: {emailVerified: true},
                $unset: {emailVerificationCode: ""}
            }, 
            {
                new: true
            }
        );
        if (!user) {
            throw new Error("Error: Token timed  out or already verified.");
        }
        const newAccessToken = generateAccessToken(user.email, user.role, user.emailVerified);
        const newRefreshToken = generateRefreshToken(user.email);


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
        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
        });
        await user.replaceRefreshToken(newRefreshToken, oldRefreshToken);

    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
