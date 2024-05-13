const mongoose = require('mongoose');
const {obj: {PERCENT, TOTAL}, arr: discount_type_arr} = require("../constants/discount_types");
const Schema = mongoose.Schema;

const DiscountCodeSchema = new Schema({
	code: {type: String, required: true, unique: true },
	description: {type: String, required: true},
	minCost: {type: Number, default: 0},
	discount: {type: Number, default: 0},
	discountType: {type: Number, default: 0, enum: discount_type_arr, default: TOTAL},
	active: {type: Boolean, default: false},
	text: {type: String, default: function() {
		return `Use code "${this.code}" for ${this.discountType == TOTAL ? '$' + this.discount : this.discount + "%"} off` + (this.minCost > 0 ? ` orders over $${this.minCost}.` : '.');
	}},
	redirectTo: {type: String},
	imageUrl: {type: String},
}, {timestamps: true})

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
