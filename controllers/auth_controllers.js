const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const schema = new passwordValidator();
const { generateAccessToken } = require('../utils/jwt');



schema
.is().min(5)
.is().max(100)
.has().uppercase()
.has().lowercase()
.has().digits()

module.exports.registerController = async (req, res) => {
    try
    {
        const body = req.body;
        const email = body.email;
        const password = body.password;
        const firstName = body.firstName;
        const lastName = body.lastName;
        if (!schema.validate(password) || !emailValidator.validate(email)) { return res.sendStatus(500) }

        const hashedPassword = await bcrypt.hash(password, 10)
       
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();
        console.log(process.env.secretKey);
        const token = jwt.sign({userEmail: user.email}, process.env.ACCESS_TOKEN_SECRET, { 
            expiresIn: '15m'
        });
        const refreshToken = jwt.sign({userEmail: user.email}, process.env.REFRESH_TOKEN_SECRET, { 
            expiresIn: '24h'
        });
        res.cookie('token',token,{httpOnly: true, maxAge: 1000 * 60 * 15})
        res.cookie('refreshToken',refreshToken,{httpOnly: true, maxAge: 1000 * 60 * 60 * 24})
        user.refreshTokens.push({token:refreshToken,expiration: new Date(
            Date.now() + 1000*60*60*24
        )})
        await user.save()

        console.log(req.body);
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

modules.exports.loginController = async (req, res) => {
    try {
        const { email, password } = req.body

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
        res.cookie("token", accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: false,
            signed: false
        })

        const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET)
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: false,
            signed: false
        })

        user.refreshTokens.push({
            token: refreshToken,
            expiration: new Date(Date.now() + 1000 * 60 * 60 * 24)
        });

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