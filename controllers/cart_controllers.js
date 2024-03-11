const User = require("../models/user");

module.exports.addItemToCart = async (req, res, next) => {
    try {
        const email = req.user?.email;
        const {sku, size, quantity} = req.body;
        const user = await User.findOne({email});
        const {cart} = await user.cartItemAdd(sku, size, quantity);
        res.status(200).json({cart});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeItemFromCart = async (req, res, next) => {
    try {
        const email = req.user?.email;
        const {sku} = req.body;
        const user = await User.findOne({email});
        const {cart} = await user.cartItemRemove(sku);
        res.status(200).json({cart});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.setItemQuantityCart = async () => {
    try {
        const email = req.user?.email;
        const {sku, quantity} = req.body;
        const user = await User.findOne({email});
        const {cart} = await user.cartItemSetQuantity(sku, quantity);
        res.status(200).json({cart});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.clearCart = async () => {
    try {
        const email = req.user?.email;
        const user = await User.findOne({email});
        const {cart} = await user.cartClear();
        res.status(200).json({cart});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
