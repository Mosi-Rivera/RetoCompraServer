const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const schema = new passwordValidator();


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
        if (!schema.validate(password) || !emailValidator.validate(email))
        {return res.sendStatus(500)}

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
        res.cookie('token',token,{httpOnly:true,maxAge:1000*60*15})
        res.cookie('refreshToken',refreshToken,{httpOnly:true,maxAge:1000*60*60*24})
        user.refreshTokens.push({token:refreshToken,expiration: new Date(
            Date.now() + 1000*60*60*24
        )})
        await user.save()

        console.log(req.body);
        res.status(200).json(user);
    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);
    }
}