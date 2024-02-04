const express = require('express');;
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const product_routes = require('./routes/product_routes');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');
require('dotenv').config();
const app = express();
const auth_routes = require('./routes/auth_route')

const User = require("./models/user")

if (!process.env.NODE_ENV) app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017');

app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(cookieParser());
app.use(ExpressMongoSanitize());



app.use('/api/auth', auth_routes);
app.use('/api/products', product_routes);



app.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body
        let user = await User.findOne({ email })

        if (!password || !email) {
            res.send({ message: "Invalid Credentials" })
        }

        if (!user) {
            res.send({ error: "Invalid Credentials" });
        }
        //compares the password with the hashed password in the db
        const validPassword = await bcrypt.compare(password, user.password)



        if (validPassword) {
            // uses a jwt generateAccessToken function which accepts one attributes (userEmail)
            const accessToken = generateAccessToken(email)
            //sets a cookie in response object
            res.cookie("token", accessToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                secure: false,
                signed: false
            })
            //creates a refresh token with a signanture, which takes the user email and the Refresh Token Secret
            const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET)

            //sets a refreshToken in the response object
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24,
                secure: false,
                signed: false

            })
            // this will save the refresh token into the database
            user.refreshTokens.push({
                token: refreshToken,
                expiration: new Date(Date.now() + 1000 * 60 * 60 * 24)
            });
            //responds with a status 200 and with a json with the accesstoken and refreshtoken
            res.status(200).json({
                msg: `Welcome ${user.firstName} ${user.lastName}`
            })
        }
    } catch (error) {
        console.log("error")
        res.send({ error: "Invalid Credentials" + error })
    }
})

function generateAccessToken(userEmail) {
    //creates a access tokent that takes the usermail and expiresIn value, this function is called inside the /signin post route
    return jwt.sign({ userEmail }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" })

}


app.get('*', (req, res, next) => {
    res.sendStatus(404) && next(new Error('Route not found.\n' + req.protocol + '://' + req.get('host') + req.originalUrl));
});

app.get("*", (req, res) => {
    res.status(200).json({
        message: 'User registered successfully'
    });
});
const port = 4800
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});