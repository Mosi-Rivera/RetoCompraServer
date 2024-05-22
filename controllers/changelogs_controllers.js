const Variant = require('../models/Variant');
const ChangeLog = require("../models/change_log");

module.exports.getChanglogsController = async (req, res, next) => {
    try {
        const {documentId} = req.query;
        delete req.query.documentId;

        let [query, skip, limit, sort] = Variant.parseQuery(req.query);
        sort = sort || {createdAt: -1};
        if (documentId) {
            query.$or = [
                {product: documentId},
                {variant: documentId},
                {user: documentId},
                {order: documentId},
                {userId: documentId},
            ];
        }
        const result = await ChangeLog.aggregate([
            { $match: query },
            { $sort: sort },
            { $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: {path: "$product", preserveNullAndEmptyArrays: true  } },
                    {
                        $lookup: {
                            from: "variants",
                            localField: "variant",
                            foreignField: "_id",
                            as: "variant"
                        }
                    },
                    { $unwind: {path: "$variant", preserveNullAndEmptyArrays: true} },
                    {
                        $lookup: {
                            from: "users",
                            localField: "user",
                            foreignField: "_id",
                            as: "user"
                        }
                    },
                    { $unwind: {path: "$user", preserveNullAndEmptyArrays: true} },
                    {
                        $lookup: {
                            from: "orders",
                            localField: "order",
                            foreignField: "_id",
                            as: "order"
                        }
                    },
                    { $unwind: {path: "$order", preserveNullAndEmptyArrays: true} },
                    {
                        $project: {
                            _id: 1,
                            "userId": 1,
                            "action": 1,
                            "documentType": 1,
                            "userEmail": 1,
                            "userRole": 1,
                            "createdAt": 1,
                            "product._id": 1, 
                            "product.name": 1, 
                            "product.section": 1, 
                            "product.brand": 1,
                            "variant._id": 1,
                            "variant.product": 1,
                            "user._id": 1,
                            "user.email": 1,
                            "user.role": 1,
                            "order._id": 1
                        }
                    }
                ]
            }},
            { $project: {
                count: { $arrayElemAt: ["$metadata.total", 0] },
                logs: "$data"
            }}
        ]);
        const [{logs, count}] = result;

        res.status(200).json({logs, pages: Math.ceil(count / limit), count});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
