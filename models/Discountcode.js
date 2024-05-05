const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountCodeSchema = new Schema({
	code: {type: String, required: true},
	description: {type: String, required: true},
	minCost: {type: Number, default: 0},
	staticDiscount: {type: Number, default: 0},
	percentDiscount: {type: Number, default: 0},
	active: {type: Boolean, default: false}
}, {timestamps: true})

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
