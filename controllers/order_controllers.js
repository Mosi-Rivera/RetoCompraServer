const Order = require("../models/order");
const User = require("../models/user");
const ChangeLog = require('../models/change_log');
const { parseInputStrToInt } = require("../utils/input");
const { sendEmail } = require("../utils/mailer");

module.exports.setDeliveryStatusController = async (req, res, next) => {
    try {
        const {order_id, status} = req.body;
        const order = await Order.findByIdAndUpdate(order_id, {$set: {status}});
        if (!order) {
            return res.sendStatus(404) && next(new Error("Order not found."));
        }

        const user = (await User.findOne({email: req.email}));
        if (user) {
            ChangeLog.orderModify(
                user._id,
                order._id,
                {statusSetTo: status}
            );
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.getOrdersController = async (req, res, next) => {
    try {
        let {limit, page, sort, email} = req.query;
        delete req.query.limit;
        delete req.query.page;
        delete req.query.sort;
        delete req.query.email;
        limit = parseInputStrToInt(limit, 25);
        page = parseInputStrToInt(page, 1);
        page = page <= 0 ? 1 : page;
        
        switch (sort) {
            case 'old': sort = {createdAt: 1}; break;
            default: sort = {createdAt: -1}; break;
        }
        const pipeline = [
            { $match: req.query },
            { $sort: sort || { createdAt: -1 } },
            { 
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {$unwind: "$user" },
            {$project: {
                "user.firstName": 1,
                "user.lastName": 1,
                "user.email": 1,
                "user._id": 1,
                "_id": 1,
                items: 1,
                taxes: 1,
                totalPrice: 1,
                shippingAddress: 1,
                status: 1,
                createdAt: 1
            }},
        ];
        if (email) {
            pipeline.push({$match: {
                'user.email': { $regex: new RegExp(`.*${email.replace(/\s+/g, ".*")}.*`, 'i') }
            }});
        }
        pipeline.push(
            { $group: {
                _id: null,
                count: { $sum: 1 },
                orders: { $push: '$$ROOT' }
            }},
            {$project: {
                    count: 1,
                    orders: { $slice: ["$orders", (page - 1) * limit, limit] }
            }}
        );
        const  [result] = await Order.aggregate(pipeline);
        if (!result) {
            return res.status(200).json({orders: [], count: 0, pages: 0});
        }
        const { orders, count } = result;
        res.status(200).json({orders, count, pages: Math.ceil(count / limit)});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

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
