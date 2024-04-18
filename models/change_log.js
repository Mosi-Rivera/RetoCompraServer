const mongoose = require('mongoose');
const User = require('./user');
const Variant = require('./Variant');
const Product = require('./Product');
const Order = require('../models/order');
const Schema = mongoose.Schema;

const changeLogSchema = new Schema({
	userId: {type: mongoose.Types.ObjectId, required: true, ref: User},
	action: {type: String, requierd: true, enum: ["delete", "modify", "create"]},
	variant: {type: mongoose.Types.ObjectId, ref: Variant},
	product: {type: mongoose.Types.ObjectId, ref: Product},
	user: {type: mongoose.Types.ObjectId, ref: User},
	order: {type: mongoose.Types.ObjectId, ref: Order},
	description: {type: String, required: true}
}, {
});

changeLogSchema.statics.variantCreate = function(userId, variant) {
	return this.create({
		userId: userId,
		action: "create",
		variant: variant._id,
		// description: variant ? variant.toString() : "Variant created." 
		description: "Variant created." 
	});
}

changeLogSchema.statics.productCreate = function(userId, product) {
	return this.create({
		userId: userId,
		action: "create",
		product: product._id,
		// description: product ? product.toString() : "Product created." 
		description: "Product created." 
	});
}

changeLogSchema.statics.userCreate = function(userId, user) {
	return this.create({
		userId: userId,
		action: "create",
		user: user._id,
		// description: user ? user.toString() : "User created." 
		description: "User created." 
	});
}

changeLogSchema.statics.orderCreate = function(userId, order) {
	return this.create({
		userId: userId,
		action: "create",
		order: order._id,
		// description: order ? order.toString() : "Order created." 
		description: "Order created." 
	});
}

changeLogSchema.statics.variantDelete = function(userId, variantId) {
	return this.create({
		userId: userId,
		action: "delete",
		variant: variantId,
		description: "Deleted Variant."
	});
}

changeLogSchema.statics.productDelete = function(userId, productId) {
	return this.create({
		userId: userId,
		action: "delete",
		product: productId,
		description: "Deleted Product."
	});
}

changeLogSchema.statics.userDelete = function(userId, userIdDeleted) {
	return this.create({
		userId: userId,
		action: "delete",
		user: userIdDeleted,
		description: "Deleted User."
	});
}

changeLogSchema.statics.orderDelete = function(userId, orderId) {
	return this.create({
		userId: userId,
		action: "delete",
		order: orderId,
		description: "Deleted Order."
	});
}


changeLogSchema.statics.variantModify = function(userId, variantId, update) {
	return this.create({
		userId: userId,
		action: "modify",
		variant: variantId,
		description: update ? JSON.stringify(update) : "Variant modified." 
	});
}

changeLogSchema.statics.productModify = function(userId, productId, update) {
	return this.create({
		userId: userId,
		action: "modify",
		product: productId,
		description: update ? JSON.stringify(update) : "Product modified." 
	});
}

changeLogSchema.statics.userModify = function(userId, userIdModified, update) {
	return this.create({
		userId: userId,
		action: "modify",
		user: userIdModified,
		description: update ? JSON.stringify(update) : "User modified." 
	});
}

changeLogSchema.statics.orderModify = function(userId, orderId, update) {
	return this.create({
		userId: userId,
		action: "modify",
		order: orderId,
		description: update ? JSON.stringify(update) : "Order modified." 
	});
}

module.exports = mongoose.model('ChangeLog', changeLogSchema);
