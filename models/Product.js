const mongoose = require('mongoose');
const sections_constants = require('../constants/SECTIONS');
const ProductSchema = new mongoose.Schema({
	name: {type: String, required: true},
	description: {type: String, required: true},
	section: {
		type: String,
		enum: sections_constants.arr,
		default: sections_constants.obj.MEN
	},
	brand: {type: String, required: true}
},
{
	timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);