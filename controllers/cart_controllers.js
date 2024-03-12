const Variant = require("../models/Variant");
const User = require("../models/user");

module.exports.getCart = async (req, res, next) => {
    try {
        const email = req.email;
        const user = await User.findOne({email});
        res.status(200).json({cart: user.cart, totalPrice: await user.cartCalculateTotalPrice()});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.addItemToCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, size, quantity} = req.body;
        let user = await User.findOne({email});
        user = await user.cartItemAdd(sku, size, quantity);
        res.status(200).json({cart: user.cart, totalPrice: await user.cartCalculateTotalPrice()});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeItemFromCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, size} = req.body;
        let user = await User.findOne({email});
        user = await user.cartItemRemove(sku, size);
        res.status(200).json({cart: user.cart, totalPrice: await user.cartCalculateTotalPrice()});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.setItemQuantityCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, quantity, size} = req.body;
        let user = await User.findOne({email});
        user = await user.cartItemSetQuantity(sku, size, quantity);
        res.status(200).json({cart: user.cart, totalPrice: await user.cartCalculateTotalPrice()});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.clearCart = async (req, res, next) => {
    try {
        const email = req.email;
        const user = await User.findOne({email});
        const {cart} = await user.cartClear();
        res.status(200).json({cart, totalPrice: 0});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
