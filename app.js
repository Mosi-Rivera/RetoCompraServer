const express = require('express');;
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const product_routes = require('./routes/product_routes');
const cors = require('cors');
require('dotenv').config();
const app = express();
const bcrypt = require('bcrypt');
const User = require('./model/user')
const passwordValidator = require('password-validator')
const emailValidator = require('email-validator')

if (!process.env.NODE_ENV) app.use(cors());

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017');

app.use(BodyParser.urlencoded({extended: false}));
app.use(BodyParser.json());
app.use(cookieParser());
app.use(ExpressMongoSanitize());

app.use('/api/products', product_routes);

app.get('*', (req, res, next) => {
    res.sendStatus(404) && next(new Error('Route not found.\n' + req.protocol + '://' + req.get('host') + req.originalUrl));
});

const PORT = process.env.PORT || 4800;
app.listen(PORT, err => {
    if (err)
        return console.log(err);
    console.log('Listening on port: ' + PORT);
});

// RegisterForm Connection with Back-end 

mongoose.connect("mongodb://localhost:27017");

// reading body (info or data from register form; reading todo los json & urlencoded)
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());

//Validating password? is the below correct seems not connected 

var schema = new passwordValidator();

schema
.is().min(5)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                //  any  digits allow 

console.log(schema.validate('validPASS123')); //only to validate functionality 

console.log(schema.validate('invalidPASS')); //only to validate functionality 


//Hash which should be within the try?
//    const jwt = require('jsonwebtoken'); // creo q esto fue lo de jwt q estaban hablando --> aun no lo entiendo

    // // Define the payload (data to be included in the token)
    // const payload = {
    //     userId: 'user123', // Example user ID
    //     username: 'example_user'
    // };
    
    // // Secret key used to sign the token
    // const secretKey = 'your_secret_key'; // Replace with your own secret key
    
    // // Options for the JWT token
    // const options = {
    //     expiresIn: '1h' // Token expiration time (e.g., 1 hour)
    // };
    
    // // Generate a JWT token
    // const token = jwt.sign(payload, secretKey, options);
    
    // console.log('JWT token:', token);


//I believe this is the auth controller; but how to break to correct folder?

app.post("/register", async (req, res) => {
    try
    {
        const body = req.body;
        const email = body.email;
        const password = body.password;
        const first_name = body.first_name;
        const last_name = body.last_name;
        if (!schema.validate(password) || !emailValidator.validate(email))
        {return res.sendStatus(500)}

        const hashedPassword = await bcrypt.hash(plaintextPassword, 10)
       
        const new_user = new User({
            first_name,
            last_name,
            email,  
            password: hashedPassword
        });
        const user = await new_user.save();
        const token = jwt.sign({userEmail: user.email}, process.env.secretKey, { 
            expiresIn: '15m'
        });
        const refreshToken = jwt.sign({userEmail: user.email}, process.env.secretKey, { 
            expiresIn: '24h'
        });
        res.cookie('token',token,{httpOnly:true,maxAge:1000*60*15})
        res.cookie('refreshToken',refreshToken,{httpOnly:true,maxAge:1000*60*60*24})
        user.refresh_tokens.push({token:refreshToken,expiration: new Date(
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
});

app.get("*", (req, res) => {
    res.status(200).json({
        message: 'User registered successfully'
    });
});

app.listen(4800, () => {
    console.log('Listening on port: 4800');
    console.log(`Server is running on http://localhost:${port}`);
});