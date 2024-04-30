const mongoose = require('mongoose');
const sizes = require('../constants/size');
const Variant = require('./Variant');
const User = require('../models/user');
const { wrapWithEmailHTML } = require('../utils/emailHTML');
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
		totalPrice: { type: Number, required: true },
		shippingAddress: { type: String, required: true },
		status: { type: String, enum: status_arr, default: PENDING }
	}, {
	timestamps: true
}
);

orderSchema.statics.handleOrderTransaction = async function (email, addressString) {
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

		const newOrder = new this({
			user: user._id,
			items,
			taxes: (totalPrice * 0.115).toFixed(2),
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

const toTableCell = str => '<td>' + str + '</td>';

const generateItemRows = items => {
	let result = '';
	for (const item of items) {
		result += '<tr>';
		result += toTableCell('<img width="100" src="' + item.image + '"/>');
		result += toTableCell(item.name);
		result += toTableCell(item.size);
		result += toTableCell(item.quantity);
		result += toTableCell(item.price);
		result += toTableCell((item.quantity * item.price).toFixed(2));
		result += '</tr>';
	}
	return result;
}

orderSchema.methods.toHTMLOrderConfirmation = function (userInformation) {
	const html = wrapWithEmailHTML(`<div>
<div><img src="#"/></div>
<div>
<p>Dear ${userInformation.firstName},<br/><br/>Thank you for shopping at Graphic Groove! We're excited to confirm your recent order with us. Below are the details of your purchase:</p>
<h4>Order confirmation: ${this._id}</h4>
<h6>Order Date: ${this.created_at}</h6>
</div>
<div>
<span>${userInformation.firstName} ${userInformation.lastName}</span>
<span>${this.shippingAddress}</span>
</div>
<table>
<tr>
<th></th>
<th>name</th>
<th>size</th>
<th>quantity</th>
<th>price</th>
<th>totalPrice</th>
</tr>
${generateItemRows(this.items)}
</table>
<div>
<div><span>Subtotal:</span> <strong>${this.totalPrice}</strong></div>
<div><span>Tax:</span> <strong>${this.taxes}</strong></div>
<div><span>Order Total:</span> <strong>${(this.totalPrice + this.taxes).toFixed(2)}</strong></div>
</div>
<div>
<p>Thank you again for choosing Graphic Groove. We appreciate your business and hope you enjoy your purchase!<br/>Best Regards,<br/>Graphic Groove</p>
</div>
</div>
`);
	return html;
}

module.exports = mongoose.model('Order', orderSchema);
