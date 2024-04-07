const sizes = require('../constants/size');
const roleConstants = require('../constants/role');
const mongoose = require("mongoose");
const Variant = require('./Variant');
const { parseInputStrToInt } = require('../utils/input');

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
    }],
    emailVerificationId: {type: String, required: true},
    emailVerified: {type: Boolean, default: false}
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
            select: 'product price assets.thumbnail stock color',
            populate: {
                path: 'product',
                select: 'name'
            }
        });
    if (!user)
        throw new Error("Err: user not found.");
    return {items: user.cart};
}

UserSchema.statics.cartItemRemove = async function(email, sku, size) {
    const user = await this.findOneAndUpdate({email}, {
        $pull: {
            cart: {
                variant: sku,
                size
            }
        }
    }, {cart: 1, _id: 0}, {new: true});
    if (!user)
        throw new Error('Error: Item not found and therefor not removed.');
    return user;
}

UserSchema.statics.cartItemAdd = async function (email, sku, size, quantity) {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        sku = new mongoose.Types.ObjectId(sku);
        quantity = parseInputStrToInt(quantity, 1);
        const variant = await Variant.findById(sku, {[`stock.${size}.stock`]: 1}, {session});
        if (!variant || !variant.stock?.[size]?.stock)
        throw new Error('Invalid sku or stock out of stock.');
        const stock = variant.stock?.[size]?.stock || 0;
        if (!await this.findOne({email, cart: {$elemMatch: {size, variant: sku}}}, {_id: 1}, {session})) {
            await this.updateOne({
                email,
            },
                {
                    $push: {
                        cart: {
                            variant: sku,
                            size,
                            quantity
                        }
                    }
                },
                {session}
            );
        }
        else {
            await this.aggregate([
                {
                    $match: {
                        email,
                        cart: { $elemMatch: {
                            variant: sku,
                            size
                        } }
                    }
                },
                {
                    $set: {
                        cart: {
                            $map: {
                                input: "$cart",
                                as: "item",
                                in: {
                                    $cond: {
                                        if: { $and: [
                                            { $eq: ["$$item.variant", sku] },
                                            { $eq: ["$$item.size", size] }
                                        ] },
                                        then: {
                                            $mergeObjects: [
                                                "$$item",
                                                { quantity: { $min: [{ $add: ["$$item.quantity", quantity]}, Math.min(stock, 5)] } }
                                            ]
                                        },
                                        else: "$$item"
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $merge: {
                        into: "users",
                        on: "_id",
                        whenMatched: "replace"
                    }
                }
            ]);
        }
        await session.commitTransaction();
        session.endSession();
        return await this.findOne({email}).select({_id: 0, cart: 1});
    } catch (error) {
        console.log(error)
        await session.abortTransaction();
        session.endSession();
    }
}

UserSchema.statics.cartItemSetQuantity = async function(email, sku, size, quantity) {
    quantity = parseInputStrToInt(quantity, 1);
    const variant = await Variant.findById(sku, {[`stock.${size}.stock`]: 1, _id: 0});
    if (!variant)
        throw new Error("Error: Invalid product sku.");
    const stock = variant.stock[size].stock;
    quantity = Math.min(stock, quantity);
    const user = await this.findOneAndUpdate(
        {
            email: email,
            cart: {
                $elemMatch: {
                    variant: sku,
                    size: size
                }
            }
        },
        {
            $set: {
                'cart.$.quantity': quantity
            }
        },
        {
            new: true
        }
    ).select({cart: 1, _id: 0});
    if (!user)
        throw new Error('Error: Item not found.');
    return (Math.min(quantity, 5));
}

UserSchema.statics.cartClear = function(email) {
    this.updateOne({email}, {
        $set: {cart: []}
    });
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
