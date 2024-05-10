const mongoose = require('mongoose');
const {obj: {PERCENT, TOTAL}, arr: discount_type_arr} = require("../constants/discount_types");
const Schema = mongoose.Schema;

const DiscountCodeSchema = new Schema({
	code: {type: String, required: true, unique: true},
	description: {type: String, required: true},
	minCost: {type: Number, default: 0},
	discount: {type: Number, default: 0},
	discountType: {type: Number, default: 0, enum: discount_type_arr, default: TOTAL},
	active: {type: Boolean, default: false},
	banner: {
		type: {
			_id: false,
			show: {type: Boolean},
			redirectTo: {type: String},
			imageUrl: {type: String},
			text: {type: String, default: function() {
				const parent = this.parent();
				return `Use code "${parent.code}" for ${parent.discountType == PERCENT ? '$' + parent.discount : parent.discount + "%"} off` + (parent.minCost > 0 ? ` orders over $${parent.minCost}.` : '.');
			}}
		},
		required: false
	}
}, {timestamps: true})

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
