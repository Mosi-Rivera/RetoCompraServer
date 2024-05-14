require('dotenv').config();
const express = require('express');;
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/auth_route')
const productRoutes = require('./routes/product_routes');
const cartRoutes = require('./routes/cart_routes');
const orderRoutes = require('./routes/order_routes');
const changelogRoutes = require('./routes/change_logs_routes');
const discountCodeRoutes = require('./routes/discount_code_routes');
const usersRoutes = require('./routes/user_routes');
const cors = require('cors');
const app = express();
if (!process.env.NODE_ENV) app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/clothingStore');

app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json({limit: "25mb"}));
app.use(cookieParser());
app.use(ExpressMongoSanitize());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/changelogs', changelogRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/discount_codes', discountCodeRoutes);

app.use('*', (req, res, next) => {
    res.sendStatus(404) && next(new Error('Route not found.\n' + req.protocol + '://' + req.get('host') + req.originalUrl + '\nmethod: ' + req.method));
});

const port = 4800
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
