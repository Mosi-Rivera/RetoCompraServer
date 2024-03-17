const Variant = require("../models/Variant");
const User = require("../models/user");

module.exports.getCart = async (req, res, next) => {
    try {
        const email = req.email;
        const cart = await User.getCart(email);
        res.status(200).json(cart);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.addItemToCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, size, quantity} = req.body;
        const newAmount = await User.cartItemAdd(email, sku, size, quantity);
        res.status(200).json({newAmount});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeItemFromCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, size} = req.body;
        await User.cartItemRemove(email, sku, size);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.setItemQuantityCart = async (req, res, next) => {
    try {
        const email = req.email;
        const {sku, quantity, size} = req.body;
        await User.cartItemSetQuantity(email, sku, size, quantity);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.clearCart = async (req, res, next) => {
    try {
        const email = req.email;
        await User.cartClear(email);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
