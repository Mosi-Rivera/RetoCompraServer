const mongoose = require('mongoose');
const sectionsConstants = require('../constants/section');
const Variant = require('./Variant');
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

ProductSchema.pre('remove', async(next) =>
{ try { 
	await Variant.deleteMany ({ product: this._id});
	next();
} catch (eror) {
	next(eror);
}
})  

module.exports = mongoose.model('Product', ProductSchema);

//pending delete method (logical removal); product ID to be diable or hidden but not actually deleted
