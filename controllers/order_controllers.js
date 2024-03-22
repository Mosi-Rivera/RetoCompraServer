const Order = require("../models/order");
const { sendEmail } = require("../utils/mailer");

module.exports.checkoutController = async (req, res, next) => {
    try {
        const {street, country, city, zip} = req.body;
        const email = req.email;
        if (!street || !country || !city) {
            return res.status(403).json({field: 'server', error: 'Please fill all required fields.'}) && next(new Error('Missing address fields.'));
        }

	const addressString = `${street} ${country} ${city} ${zip}`;
        const [order, user] = await Order.handleOrderTransaction(email, addressString);

        sendEmail(email, order.toHTMLOrderConfirmation(user));

        res.status(200).json(order);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
