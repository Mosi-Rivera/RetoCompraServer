const mongoose = require('mongoose');
const sizes_constants = require('../constants/SIZES');
const currency_constants = require('../constants/CURRENCIES');
const Product = require('./Product');
const {NEW, HIGH, LOW, POPULAR} = require('../constants/SORT').obj;
const VariantSchema = new mongoose.Schema({
    sizes: [{
        size: {type: String, required: true, enum: sizes_constants.arr},
        stock: {type: Number, required: true, min: [0, 'Quantity cannot be less than zero'], default: 0}
    }],
    color: {type: String, required: true},
    price: {
        currency: {type: String, enum: currency_constants.arr, default: currency_constants.obj.USD},
        value: {type: Number, min: [0.01, "Price value must be greater than zero."], required: true}
    },
    assets: {
        thumbnail: {type: String, required: true},
        images: [String]
    },
    popularity_index: {type: Number, default: 0},
    product: {type: mongoose.Types.ObjectId, required: true, ref: Product},
    //duplicated fields
    name: {type: String, required: true},
    brand: {type: String, required: true},
    section: {type: String, required: true}

}, {
    timestamps: true
});

VariantSchema.index({brand: 1, size: 1, color: 1, section: 1, 'price.value': 1, popularity_index: 1});

VariantSchema.statics.parseSort = (sort) => {
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

VariantSchema.statics.priceFilterToQuery = (min_price, max_price) => {
	min_price = parseInt(min_price);
	min_price = isNaN(min_price) ? null : min_price;
	max_price = parseInt(max_price);
	max_price = isNaN(max_price) ? null : max_price;
	if (min_price !== null && max_price !== null)
		return {$and: [{'price.value': {$gte: min_price}}, {'price.value': {$lte: max_price}}]};
	else if (min_price !== null)
		return {'price.value': {$gte: min_price}};
	else if (max_price !== null)
		return {'price.value': {$lte: max_price}};
	return false;
}
VariantSchema.statics.parseLimit = (limit) => {
    limit = parseInt(limit);
	limit = isNaN(limit) ? 50 : limit;
    return limit;
}

VariantSchema.statics.parsePageToSkip = (page, limit) => {
    page = parseInt(page);
	page = isNaN(page) ? 1 : Math.max(1, page);
    return (page - 1) * limit;
}

VariantSchema.statics.parseQuery = function(query)
{
	let limit = this.parseLimit(query.limit);
	let skip = this.parsePageToSkip(query.page, limit);
	let sort = this.parseSort(query.sort);
	let price_query = this.priceFilterToQuery(query.min_price, query.max_price);
    let size = query.size;
    delete query.size;
	delete query.limit;
	delete query.page;
	delete query.sort;
	delete query.min_price;
	delete query.max_price;
	if (price_query) query = {...query, ...price_query};
    if (size) query.size = {'sizes.size': 'size'};
	return [query,  skip, limit, sort];
}

module.exports = mongoose.model('Variant', VariantSchema);