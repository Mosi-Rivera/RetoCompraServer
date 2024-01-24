const mongoose = require('mongoose');
const sections_constants = require('../constants/SECTIONS');
const {NEW, POPULAR, LOW, HIGH} = require('../constants/SORT').obj;
const ProductSchema = new mongoose.Schema({
	name: {type: String, required: true},
	description: {type: String, required: true},
	sections: {
		type: [
			{type: String, enum: sections_constants.arr}
		], 
		default: [sections_constants.obj.MEN]
	},
	brand: {type: String, required: true}
},
{
	timestamps: true
});

ProductSchema.statics.parseQuery = function(query)
{
	let limit = query.limit;
	let page = query.page;
	let sort = query.sort;
	delete query.limit;
	delete query.page;
	delete query.sort;
	limit = parseInt(limit);
	limit = isNaN(limit) ? 50 : limit;
	page = parseInt(page);
	page = isNaN(page) ? 1 : Math.max(1, page);
	switch (sort)
	{
		case NEW: sort = {createdAt: -1}; break;
		case POPULAR: sort = {popularity_index: -1}; break;
		case LOW: sort = {price: 1}; break;
		case HIGH: sort = {price: -1}; break;
		default: sort = null;
	}
	return [query, (page - 1) * limit, limit, sort];
}

module.exports = mongoose.model('Product', ProductSchema);