const mongoose = require('mongoose');
const {obj: discount_type_obj, arr: discount_type_arr} = require("../constants/discount_types");
const Schema = mongoose.Schema;

const DiscountCodeSchema = new Schema({
	code: {type: String, required: true, unique: true},
	description: {type: String, required: true},
	minCost: {type: Number, default: 0},
	discount: {type: Number, default: 0},
	discountType: {type: Number, default: 0, enum: discount_type_arr, default: discount_type_obj.TOTAL},
	active: {type: Boolean, default: false}
}, {timestamps: true})

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
