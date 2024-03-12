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
            quantity: {type: Number, required: true, min: 1, max: 5, set: function(value){ return value > 5 ? 5 : value; }}
        }]
    }
}, {
        timestamps: true
    }
);

UserSchema.methods.cartCalculateTotalPrice = async function() {
    const cartItems = this.cart.items;
    const ids = cartItems.map(({sku}) => sku);
    const variants = await Variant.find({_id: {$in: ids}}).select({price: {value: 1}});
    const variantsMap = new Map();
    for (const variant of variants)
        variantsMap.set(variant._id.toString(), variant);
    console.log(variantsMap);
    return cartItems.reduce((acc, {sku, quantity}) => acc + (variantsMap.get(sku.toString())?.price?.value || 0) * quantity, 0).toFixed(2);
}

UserSchema.methods.cartItemRemove = async function(sku, size) {
    if (typeof sku === 'string')
        sku = new mongoose.Types.ObjectId(sku);
    this.cart.items = this.cart.items.filter(({sku: itemSku, size: itemSize}) => !(itemSku.equals(sku) && itemSize == size));
    return this.save();
}

UserSchema.methods.cartItemAdd = async function (sku, size, quantity) {
    let didAddFlag = false;
    if (typeof sku === 'string')
        sku = new mongoose.Types.ObjectId(sku);

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

    const stock = variant.stock[size].stock;
    if (stock == 0)
    {
        return this.cartItemRemove(sku, size);
    }

    for (const item of this.cart.items)
    {
        if (item.sku.equals(sku) && item.size === size)
        {
            didAddFlag = true;
            console.log(quantity, item, quantity, item.quantity, stock, Math.max(quantity, stock));
            item.quantity = Math.min(item.quantity + quantity, stock);
            break;
        }
    }

    if (!didAddFlag)
    {
        this.cart.items.push({sku, size, quantity});
        console.log(sku, size, quantity);
    }
    return this.save();
}

UserSchema.methods.cartItemSetQuantity = async function(sku, size, quantity) {
    if (typeof sku === 'string')
        sku = new mongoose.Types.ObjectId(sku);

    if (typeof quantity == 'string')
    {
        quantity = parseInt(quantity.trim());
        if (isNaN(quantity))
            throw new Error('Error: Invalid quantity.');
        else if (quantity === 0)
        {
            this.cartItemRemove(sku, size);
        }
    }

    if (!sizes.arr.includes(size))
        throw new Error("Error: Invalid size.");

    const variant = await Variant.findById(sku);
    if (!variant)
        throw new Error("Error: Invalid sku.");


    for (const item of this.cart.items)
    {
        if (item.sku.equals(sku) && item.size === size)
        {
            const stock = variant.stock[item.size].stock;
            if (stock == 0)
            {
                return this.cartItemRemove(sku, size);
            }
            quantity = Math.min(stock, quantity);
            item.quantity = quantity;
            return this.save();
        }
    }
    return this;
}

UserSchema.methods.cartClear = async function() {
    this.cart.items = [];
    return this.save();
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
