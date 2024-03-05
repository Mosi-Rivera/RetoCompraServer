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

ProductSchema.statics.parseQuery = function(query)
{
	const result = {};
	if (query.name) 
		result.name = query.name;
	if (query.description) 
		result.description;
	if (query.section) 
		result.section = query.section;
	if (query.brand) 
		result.brand = query.brand;
	delete query.name;
	delete query.brand;
	delete query.section;
	delete query.description;
	return (result);
}

module.exports = mongoose.model('Product', ProductSchema);
