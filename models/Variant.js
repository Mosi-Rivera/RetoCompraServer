const mongoose = require('mongoose');
const sizes_constants = require('../constants/SIZES');
const currency_constants = require('../constants/CURRENCIES');
const VariantSchema = new mongoose.Schema({
    size: {type: String, required: true, enum: sizes_constants.arr},
    quantity: {type: Number, required: true, min: [0, 'Quantity cannot be less than zero'], default: 0},
    color: {type: String, required: true},
    price: {
        currency: {type: String, enum: currency_constants.arr, default: currency_constants.obj.USD},
        value: {type: Number, min: [0.01, "Price value must be greater than zero."], required: true}
    },
    assets: {
        thumbnail: {type: String, required: true},
        images: [String]
    },
    popularity_index: {type: Number, default: 0},
    product: {type: mongoose.Types.ObjectId, required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('Variant', VariantSchema);