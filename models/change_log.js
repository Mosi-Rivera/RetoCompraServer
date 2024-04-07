const mongoose = require('mongoose');
const User = require('./user');
const Variant = require('./Variant');
const Product = require('./Product');
const Order = require('../models/order');
const Schema = mongoose.Schema;

const changeLogSchema = new Schema({
	user: {type: mongoose.Types.ObjectId, required: true, ref: User},
	documentType: {type: String, required: true, enum: ["variant", "product", "user", "order"]},
	action: {type: String, requierd: true, enum: ["delete", "modify", "create"]},
	variant: {type: mongoose.Types.ObjectId, ref: Variant},
	product: {type: mongoose.Types.ObjectId, ref: Product},
	user: {type: mongoose.Types.ObjectId, ref: User},
	order: {type: mongoose.Types.ObjectId, ref: Order},
	description: {type: String, required: true}
}, {
});

module.exports = changeLogSchema;
