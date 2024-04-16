const express = require('express');;
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/auth_route')
const productRoutes = require('./routes/product_routes');
const cartRoutes = require('./routes/cart_routes');
const orderRoutes = require('./routes/order_routes');
const cors = require('cors');
const { verifyEmail } = require('./controllers/auth_controllers');
require('dotenv').config();
const app = express();
if (!process.env.NODE_ENV) app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/clothingStore');

app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(cookieParser());
app.use(ExpressMongoSanitize());

// app.get('/api/crudProductsroutes', async (req, res) => {
//     const body = req.body 
//     console.log(body)
//     res.status(200).json({message: "response from server"})
//     //const product = await model//

//     //need to find({}) - search all
// }
//  )

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

app.use('*', (req, res, next) => {
    res.sendStatus(404) && next(new Error('Route not found.\n' + req.protocol + '://' + req.get('host') + req.originalUrl + '\nmethod: ' + req.method));
});

const port = 4800
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
