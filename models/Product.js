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

const parseSort = (sort) => {
	switch (sort)
	{
		case NEW: sort = {createdAt: -1}; break;
		case POPULAR: sort = {popularity_index: -1}; break;
		case LOW: sort = {price: 1}; break;
		case HIGH: sort = {price: -1}; break;
		default: sort = null;
	}
	return sort;
}

const priceFilterToQuery = (min_price, max_price) => {
	min_price = parseInt(min_price);
	min_price = isNaN(min_price) ? null : min_price;
	max_price = parseInt(max_price);
	max_price = isNaN(max_price) ? null : max_price;
	if (min_price !== null && max_price !== null)
		return {$and: [{price: {$gte: min_price}}, {price: {$lte: max_price}}]};
	else if (min_price !== null)
		return {price: {$gte: min_price}};
	else if (max_price !== null)
		return {price: {$lte: max_price}};
	return false;
}

ProductSchema.statics.parseQuery = function(query)
{
	let limit = query.limit;
	let page = query.page;
	let sort = parseSort(query.sort);
	let price_query = priceFilterToQuery(query.min_price, query.max_price);
	delete query.limit;
	delete query.page;
	delete query.sort;
	delete query.min_price;
	delete query.max_price;
	if (price_query) query = {...query, ...price_query};
	limit = parseInt(limit);
	limit = isNaN(limit) ? 50 : limit;
	page = parseInt(page);
	page = isNaN(page) ? 1 : Math.max(1, page);
	return [query, (page - 1) * limit, limit, sort];
}

module.exports = mongoose.model('Product', ProductSchema);