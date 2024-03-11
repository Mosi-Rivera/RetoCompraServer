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
    cart: {
        items: [{
            _id: 0,
            sku: {type: mongoose.Types.ObjectId, required: true},
            size: {type: String, enum: sizes.arr, required: true},
            quantity: {type: Number, required: true, min: 1, max: 5}
        }]
    }
}, {
        timestamps: true
    }
);

UserSchema.methods.cartItemRemove = async function(sku) {
    if (typeof sku === 'string')
        sku = mongoose.Types.ObjectId(sku);
    this.cart.items = this.cart.items.filter(({sku: itemSku}) => !itemSku.equals(sku));
    return this.save();
}

UserSchema.methods.cartItemAdd = async function (sku, size, quantity) {
    let didAddFlag = false;
    if (typeof sku === 'string')
        sku = mongoose.Types.ObjectId(sku);

    if (typeof quantity == 'string')
    {
        quantity = parseInt(quantity.trim());
        if (isNaN(quantity) || quantity === 0)
            throw new Error('Error: Invalid quantity.');
    }

    if (!sizes.arr.includes(size))
        throw new Error("Error: Invalid size.");

    const variant = await Variant.findById(sku);
    if (!variant)
        throw new Error("Error: Invalid sku.");

    const stock = variant[size];
    if (stock == 0)
    {
        return this.removeCartItem(sku);
    }

    for (const item of this.cart.items)
    {
        if (item.sku.equals(sku))
        {
            didAddFlag = true;
            item.quantity += Math.max(quantity, stock);
            break;
        }
    }

    if (!didAddFlag)
        this.cart.items.push({sku, size, quantity});
    return this.save();
}

UserSchema.methods.cartItemSetQuantity = async (sku, quantity) => {
    if (typeof sku === 'string')
        sku = mongoose.Types.ObjectId(sku);

    if (typeof quantity == 'string')
    {
        quantity = parseInt(quantity.trim());
        if (isNaN(quantity) || quantity === 0)
            throw new Error('Error: Invalid quantity.');
    }

    const variant = await Variant.findById(sku);
    if (!variant)
        throw new Error("Error: Invalid sku.");


    for (const item of this.cart.items)
    {
        if (item.sku.equals(sku))
        {
            const stock = variant[item.size];
            if (stock == 0)
            {
                return this.removeCartItem(sku);
            }
            quantity = Math.min(stock, quantity);
            item.quantity = quantity;
            return this.save();
        }
    }
    return this;
}

UserSchema.methods.cartClear = async () => {
    this.cart.items = [];
    return this.save();
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
