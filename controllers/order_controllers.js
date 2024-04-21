const Order = require("../models/order");
const User = require("../models/user")
const { sendEmail } = require("../utils/mailer");

module.exports.checkoutController = async (req, res, next) => {
    try {
        const { streetAddress, optionalAddress, state, city, zipCode } = req.body;
        const email = req.email;
        if (!streetAddress || !state || !city || !zipCode) {
            return res.status(403).json({ field: 'server', error: 'Please fill all required fields.' }) && next(new Error('Missing address fields.'));
        }

        const addressString = `${streetAddress} ${optionalAddress} ${state} ${city} ${zipCode}`;
        const [order, user] = await Order.handleOrderTransaction(email, addressString);

        sendEmail(email, order.toHTMLOrderConfirmation(user));

        res.status(200).json(order);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
