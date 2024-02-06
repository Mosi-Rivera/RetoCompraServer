const mongoose = require('mongoose');
const sectionsConstants = require('../constants/section');
const ProductSchema = new mongoose.Schema({
	name: {type: String, required: true},
	description: {type: String, required: true},
	section: {
		type: String,
		enum: sectionsConstants.arr,
		default: sectionsConstants.obj.MEN
	},
	brand: {type: String, required: true}
},
{
	timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);