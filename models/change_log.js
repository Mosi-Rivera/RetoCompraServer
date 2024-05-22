const mongoose = require('mongoose');
const roles = require('../constants/role').arr;
const User = require('./user');
const Variant = require('./Variant');
const Product = require('./Product');
const Order = require('../models/order');
const Schema = mongoose.Schema;

const changeLogSchema = new Schema({
	userEmail: {type: String, required: true},
	userRole: {type: String, required: true, enum: roles},
	userId: {type: mongoose.Types.ObjectId, required: true, ref: User},
	documentType: {type: String, required: true, enum: ["variant", "product", "user", "order"]},
	action: {type: String, requierd: true, enum: ["delete", "modify", "create"]},
	variant: {type: mongoose.Types.ObjectId, ref: Variant},
	product: {type: mongoose.Types.ObjectId, ref: Product},
	user: {type: mongoose.Types.ObjectId, ref: User},
	order: {type: mongoose.Types.ObjectId, ref: Order},
	description: {type: String, required: true}
}, {
	timestamps: true
});

changeLogSchema.statics.variantCreate = function(user, variant) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "variant",
		action: "create",
		variant: variant._id,
		// description: variant ? variant.toString() : "Variant created." 
		description: "Variant created." 
	});
}

changeLogSchema.statics.productCreate = function(user, product) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "product",
		action: "create",
		product: product._id,
		// description: product ? product.toString() : "Product created." 
		description: "Product created." 
	});
}

changeLogSchema.statics.userCreate = function(user, user) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "user",
		action: "create",
		user: user._id,
		// description: user ? user.toString() : "User created." 
		description: "User created." 
	});
}

changeLogSchema.statics.orderCreate = function(user, order) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "order",
		action: "create",
		order: order._id,
		// description: order ? order.toString() : "Order created." 
		description: "Order created." 
	});
}

changeLogSchema.statics.variantDelete = function(user, variantId) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "variant",
		action: "delete",
		variant: variantId,
		description: "Deleted Variant."
	});
}

changeLogSchema.statics.productDelete = function(user, productId) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "product",
		action: "delete",
		product: productId,
		description: "Deleted Product."
	});
}

changeLogSchema.statics.userDelete = function(user, userIdDeleted) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "user",
		action: "delete",
		user: userIdDeleted,
		description: "Deleted User."
	});
}

changeLogSchema.statics.orderDelete = function(user, orderId) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "order",
		action: "delete",
		order: orderId,
		description: "Deleted Order."
	});
}


changeLogSchema.statics.variantModify = function(user, variantId, update) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "variant",
		action: "modify",
		variant: variantId,
		description: update ? JSON.stringify(update) : "Variant modified." 
	});
}

changeLogSchema.statics.productModify = function(user, productId, update) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "product",
		action: "modify",
		product: productId,
		description: update ? JSON.stringify(update) : "Product modified." 
	});
}

changeLogSchema.statics.userModify = function(user, userIdModified, update) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "user",
		action: "modify",
		user: userIdModified,
		description: update ? JSON.stringify(update) : "User modified." 
	});
}

changeLogSchema.statics.orderModify = function(user, orderId, update) {
	return this.create({
		userEmail: user.email,
		userRole: user.role,
		userId: user._id,
		documentType: "order",
		action: "modify",
		order: orderId,
		description: update ? JSON.stringify(update) : "Order modified." 
	});
}

module.exports = mongoose.model('ChangeLog', changeLogSchema);
