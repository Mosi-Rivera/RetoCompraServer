const mongoose = require('mongoose');
const sizes = require('../constants/size');
const Variant = require('./Variant');
const User = require('../models/user');
const { wrapWithEmailHTML } = require('../utils/emailHTML');
const {PERCENT, TOTAL} = require("../constants/discount_types").obj;
const {arr: status_arr, obj:{PENDING}} = require('../constants/delivery_status');

const orderSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Types.ObjectId, required: true, ref: User },
		items: [{
			variant: { type: mongoose.Types.ObjectId, requied: true, ref: Variant },
			image: { type: String, required: true },
			name: { type: String, required: true },
			quantity: { type: Number, required: true },
			size: { type: String, enum: sizes.arr, required: true },
			price: { type: Number, required: true }
		}],
		taxes: { type: Number, required: true },
		discount: {
			discountType: Number,
			discount: Number
		},
		totalPrice: { type: Number, required: true },
		shippingAddress: { type: String, required: true },
		status: { type: String, enum: status_arr, default: PENDING }
	}, {
	timestamps: true
}
);

orderSchema.statics.handleOrderTransaction = async function (email, addressString, discount = 0, discountType = TOTAL, discountMinCost = 0) {
	try {
		var session = await mongoose.startSession();
		session.startTransaction();

		let user = await User.findOne({ email }).session(session);
		if (!user) {
			throw new Error('Invalid email');
		}
		if (user.cart.length <= 0) {
			throw new Error('The cart is empty.');
		}

		let items = [];
		let totalPrice = 0;

		for (const { variant: sku, size, quantity } of user.cart) {
			const variant = await Variant.findOneAndUpdate(
				{ _id: sku, [`stock.${size}.stock`]: { $gte: quantity } },
				{ $inc: { [`stock.${size}.stock`]: -quantity } }
			).populate('product', 'name').session(session);
			if (!variant) {
				throw new Error('Invalid variant or insufficient stock.');
			} else {
				items.push({
					variant: variant._id,
					image: variant.assets.thumbnail,
					name: variant.product.name,
					quantity,
					size,
					price: variant.price.value
				});
				totalPrice += (variant.price.value * quantity);
			}
		}

		if (totalPrice > discountMinCost) {
			totalPrice = discountType === TOTAL ? totalPrice - discount : totalPrice * discount / 100;
		}

		const newOrder = new this({
			user: user._id,
			items,
			taxes: (totalPrice * 0.115).toFixed(2),
			discount: {
				discountType,
				discount
			},
			totalPrice: (totalPrice).toFixed(2),
			shippingAddress: addressString
		});
		const order = await newOrder.save();

		user = await User.findOneAndUpdate({ email }, { $set: { cart: [] } }, { new: true }).session(session);

		await session.commitTransaction();
		await session.endSession();

		return [order, user];
	} catch (error) {
		await session.abortTransaction();
		await session.endSession();
		throw new Error(error);
	}
}

const toTableCell = str => '<td style="text-align: center; padding: 5px 20px;">' + str + '</td>';

const generateItemRows = items => {
	let result = '';
	for (const item of items) {
		result += '<tr>';
		result += toTableCell('<img width="50" src="' + item.image + '"/>');
		result += toTableCell(item.name);
		result += toTableCell(item.size);
		result += toTableCell(item.quantity);
		result += toTableCell(item.price);
		result += toTableCell((item.quantity * item.price).toFixed(2));
		result += '</tr>';
	}
	return result;
}

const createTableHead = (text) => {
	return '<th style="text-align: center; padding: 5px 20px;">' + text + '</th>';
}

orderSchema.methods.toHTMLOrderConfirmation = function (userInformation) {
	const html = wrapWithEmailHTML(`
<div style="background-color: #EFEFEF; padding: 2em; max-width: 600px; font-family: sans-serif;">
	<div><img src="#"/></div>
	<div>
		<p style="text-align: center;">Dear ${userInformation.firstName},<br/><br/>Thank you for shopping at Graphic Groove! We're excited to confirm your recent order with us. Below are the details of your purchase:</p>
		<h4 style="text-align: center;">Order No.: ${this._id}</h4>
		<h4 style="text-align: center;">Order Date: ${this.createdAt}</h4>
	</div>
	<div style="margin-bottom: 2rem; text-align: center;">
		<strong>${userInformation.firstName} ${userInformation.lastName}</strong> - 
		<strong>${this.shippingAddress}</strong>
	</div>
	<div style="padding: 20px; background-color: white; border-radius: 4px; margin: 0 auto;">
		<h3>${this.items.reduce((acc, item) => acc + item.quantity, 0)} ITEMS</h3>
		<hr/>
		<table>
			<tr>
				${createTableHead('')}
				${createTableHead('Name')}
				${createTableHead('Size')}
				${createTableHead('Quantity')}
				${createTableHead('Price')}
				${createTableHead('Total Price')}
			</tr>
			${generateItemRows(this.items)}
		</table>
		<hr/>
		<div>
			<div style="font-size: 14px; margin-bottom: 0.5em;"><strong style="color: #666666;">SUB-TOTAL</strong> <span style="float: right; color: #666666;">${this.totalPrice}</span></div>
			<div style="font-size: 14px; margin-bottom: 0.5em;"><strong style="color: #666666;">TAX</strong> <span style="float: right; color: #666666;">${this.taxes}</span></div>
			<hr/>
			<div style="font-size: 14px; margin-bottom: 0.5em;"><strong>TOTAL</strong> <span style="float: right;">${(this.totalPrice + this.taxes).toFixed(2)}</span></div>
		</div>
	</div>
	<div>
		<p>Thank you again for choosing Graphic Groove. We appreciate your business and hope you enjoy your purchase!<br/>Best Regards,<br/>Graphic Groove</p>
	</div>
</div>

`);
	return html;
}

module.exports = mongoose.model('Order', orderSchema);
