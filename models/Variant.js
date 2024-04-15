const mongoose = require('mongoose');
const sizesConstants = require('../constants/size');
const currencyConstants = require('../constants/currency');
const Product = require('./Product');
const {NEW, HIGH, LOW, POPULAR} = require('../constants/sort').obj;

const stockObj = {
	size: {type: String, required: true, enum: sizesConstants.arr},
	stock: {type: Number, required: true, min: [0, 'Quantity cannot be less than zero'], default: 0}
};

const VariantSchema = new mongoose.Schema({
	stock: {
		[sizesConstants.obj.XS]: stockObj,
		[sizesConstants.obj.S]: stockObj,
		[sizesConstants.obj.M]: stockObj,
		[sizesConstants.obj.L]: stockObj,
		[sizesConstants.obj.XL]: stockObj,
	},
	color: {type: String, required: true},
	price: {
		currency: {type: String, enum: currencyConstants.arr, default: currencyConstants.obj.USD},
		value: {type: Number, min: [0.01, "Price value must be greater than zero."], required: true}
	},
	assets: {
		thumbnail: {type: String, required: true},
		images: [String]
	},
	popularityIndex: {type: Number, default: 0},
	product: {type: mongoose.Types.ObjectId, required: true, ref: Product},
}, {
	timestamps: true
});

VariantSchema.index({brand: 1, size: 1, color: 1, section: 1, 'price.value': 1, popularityIndex: 1});

VariantSchema.statics.parseSort = (sort) => {
	switch (sort)
	{
		case NEW: sort = {createdAt: -1}; break;
		case POPULAR: sort = {popularityIndex: -1}; break;
		case LOW: sort = {'price.value': 1}; break;
		case HIGH: sort = {'price.value': -1}; break;
		default: sort = null;
	}
	return sort;
}

VariantSchema.statics.priceFilterToQuery = (minPrice, maxPrice) => {
	minPrice = parseInt(minPrice);
	minPrice = isNaN(minPrice) ? null : minPrice;
	maxPrice = parseInt(maxPrice);
	maxPrice = isNaN(maxPrice) ? null : maxPrice;
	if (minPrice !== null && maxPrice !== null)
		return {$and: [{'price.value': {$gte: minPrice}}, {'price.value': {$lte: maxPrice}}]};
	else if (minPrice !== null)
		return {'price.value': {$gte: minPrice}};
	else if (maxPrice !== null)
		return {'price.value': {$lte: maxPrice}};
	return {};
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

VariantSchema.statics.parseSizeQuery = (size) => {
	if (sizesConstants.arr.includes(size))
	{
		return {
			[`stock.${size}.stock`]: {$gt: 0}
		};
	}
	else
	return {};
}

VariantSchema.statics.parseQuery = function(query)
{
	let limit = this.parseLimit(query.limit);
	let skip = this.parsePageToSkip(query.page, limit);
	let sort = this.parseSort(query.sort);
	let priceQuery = this.priceFilterToQuery(query.minPrice, query.maxPrice);
	let sizeQuery = this.parseSizeQuery(query.size);
	delete query.size;
	delete query.limit;
	delete query.page;
	delete query.sort;
	delete query.minPrice;
	delete query.maxPrice;
	delete query.name;
	delete query.brand;
	delete query.section;
	delete query.description;
	query = {...query, ...priceQuery, ...sizeQuery};
	return [query,  skip, limit, sort];
	}

module.exports = mongoose.model('Variant', VariantSchema);
