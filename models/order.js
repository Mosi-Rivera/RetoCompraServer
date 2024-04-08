const mongoose = require('mongoose');
const sizes = require('../constants/size');
const Variant = require('./Variant');
const User = require('../models/user');

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
		shippingAddress: { type: String, required: true }
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
	const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Your Message Subject or Title</title>
<style type="text/css">
#outlook a {padding:0;}
body{width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; margin:0; padding:0;}
.ExternalClass {width:100%;}
.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div {line-height: 100%;}
#backgroundTable {margin:0; padding:0; width:100% !important; line-height: 100% !important;}
img {outline:none; text-decoration:none; -ms-interpolation-mode: bicubic;}
a img {border:none;}
.image_fix {display:block;}
p {margin: 1em 0;}
h1, h2, h3, h4, h5, h6 {color: black !important;}
h1 a, h2 a, h3 a, h4 a, h5 a, h6 a {color: blue !important;}
h1 a:active, h2 a:active,  h3 a:active, h4 a:active, h5 a:active, h6 a:active {
color: red !important;
}

h1 a:visited, h2 a:visited,  h3 a:visited, h4 a:visited, h5 a:visited, h6 a:visited {
color: purple !important;
}
table td {border-collapse: collapse;}
table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
a {color: orange;}
@media only screen and (max-device-width: 480px) {
a[href^="tel"], a[href^="sms"] {
text-decoration: none;
color: black; /* or whatever your want */
pointer-events: none;
cursor: default;
}

.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
text-decoration: default;
color: orange !important; /* or whatever your want */
pointer-events: auto;
cursor: default;
}
}

@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
a[href^="tel"], a[href^="sms"] {
text-decoration: none;
color: blue;
pointer-events: none;
cursor: default;
}

.mobile_link a[href^="tel"], .mobile_link a[href^="sms"] {
text-decoration: default;
color: orange !important;
pointer-events: auto;
cursor: default;
}
}

@media only screen and (-webkit-min-device-pixel-ratio: 2) {
/* Put your iPhone 4g styles in here */
}
@media only screen and (-webkit-device-pixel-ratio:.75){
/* Put CSS for low density (ldpi) Android layouts in here */
}
@media only screen and (-webkit-device-pixel-ratio:1){
/* Put CSS for medium density (mdpi) Android layouts in here */
}
@media only screen and (-webkit-device-pixel-ratio:1.5){
/* Put CSS for high density (hdpi) Android layouts in here */
}
</style>
<!--[if IEMobile 7]>
<style type="text/css">
/* Targeting Windows Mobile */
</style>
<![endif]-->
<!--[if gte mso 9]>
<style>
/* Target Outlook 2007 and 2010 */
</style>
<![endif]-->
</head>
<body>
<div>
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
</body>
</html>
	`;
	return html;
}

module.exports = mongoose.model('Order', orderSchema);
