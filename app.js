const express = require('express');;
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const product_routes = require('./routes/product_routes');
const cors = require('cors');
require('dotenv').config();
const app = express();

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
