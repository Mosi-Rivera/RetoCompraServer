const sizes = require('../constants/size');
const roleConstants = require('../constants/role');
const mongoose = require("mongoose");
const Variant = require('./Variant');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {type: String, required: true, enum: roleConstants.arr, default: roleConstants.obj.CUSTOMER},
    refreshTokens: [{
        token:{type: String, required: true},
        expiration:{type: Date, required: true},
    }],
    cart: [{
        _id: 0,
        variant: {type: mongoose.Types.ObjectId, required: true, ref: Variant},
        size: {type: String, enum: sizes.arr, required: true},
        quantity: {type: Number, required: true, min: 1, max: 5, set: function(value){ return value > 5 ? 5 : value; }}
    }]
}, {
        timestamps: true
    }
);

UserSchema.statics.getCart = async function(email) {
    const user = await this.findOne({email}).select({
        _id: 0,
        cart: 1
    })
    .populate({
            path: 'cart.variant',
            select: 'color product price.value assets.thumbnail',
            populate: {
                path: 'product',
                select: 'name brand'
            }
        });
    if (!user)
        throw new Error("Err: user not found.");
    const cart = user.cart;
    const totalPrice = cart.reduce((acc, {quantity, variant}) => acc + quantity * variant.price.value, 0).toFixed(2);
    return {items: cart, totalPrice};
}

UserSchema.statics.cartItemRemove = async function(email, sku, size) {
    const {nModified} = await this.updateOne({email}, {
        $pull: {
            cart: {
                variant: sku,
                size
            }
        }
    });
    if (nModified == 0)
        throw new Error('Error: Item not found and therefor not removed.');
    return;
}

UserSchema.statics.cartItemAdd = function (sku, size, quantity) {
    if (parseInt(quantity) <= 0)
        throw new Error('Error: Invalid quantity.');
    this.updateOne({email, $elemMatch: {'cart.variant': sku, 'cart.size': size}}, {
        $inc: {'cart.$.quantity': quantity},
        $setOnInsert: {
            'cart.$': {variant: sku, quantity, size}
        }
    }, {upsert: true});
}

UserSchema.statics.cartItemSetQuantity = async function(sku, size, quantity) {
    if (parseInt(quantity) <= 0)
        throw new Error('Error: Invalid quantity.');
    const {nModified} = this.updateOne({email, $elemMatch: { variant: sku, size }}, {
        'cart.$.quantity': quantity
    });
    if (nModified === 0)
        throw new Error('Error: Item not found.');
    return;
}

UserSchema.statics.cartClear = function(email) {
    this.updateOne({email}, {
        $set: {cart: []}
    });
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
