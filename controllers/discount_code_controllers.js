const Discountcode = require('../models/Discountcode');
const DiscountCode = require('../models/Discountcode');
const {cloudinaryAddImage} = require('../utils/Imageupload');
const { parseInputStrToInt } = require('../utils/input');

module.exports.getDiscountCodes = async (req, res, next) => {
    try {
        const query = req.query;
        const page = parseInputStrToInt(query.page, 1);
        const limit = parseInputStrToInt(query.limit, 20);
        let code = req.query.code;
        let sort = query.sort;
        delete query.code;
        delete query.page;
        delete query.limit;
        delete query.sort;
        switch (sort) {
            case "old": sort = {createdAt: 1}; break;
            default: sort = {createdAt: -1}; break;
        }
        if (code) {
            query.code = { $regex: new RegExp(`.*${code.replace(/\s+/g, ".*")}.*`, 'i') };
        }
        if (query.active) {
            query.active = req.query.active == 'false' ? false : true;
        }
        if (query.discountType) {
            query.discountType = +query.discountType;
        }


        const [result] = await DiscountCode.aggregate([
            {
                $match: {
                    ...query
                },
            },
            {
                $sort: sort
            },
            {
                $group: {
                    _id: null,
                    matchedDocuments: {$push: "$$ROOT"},
                    count: {$sum: 1}
                }
            },
            {
                $project: {
                    _id: 0,
                    matchedDocuments: {
                        $slice: ["$matchedDocuments", (page - 1) * limit, limit]
                    },
                    count: 1
                }
            }
        ]);
        if (!result) {
            return res.status(200).json({codes: [], count: 0, pages: 1});
        }
        
        const {matchedDocuments: codes, count} = result;

        res.status(200).json({codes, count, pages: Math.ceil(count / limit)});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.getOneDiscountCode = async (req, res, next) => {
    try {
        const code = req.params.code;
        res.status(200).json(await DiscountCode.find({code: code}));
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.createDiscountCode = async (req, res, next) => {
    try {
        const {imageData, redirectTo, showBanner, code, description, minCost, discount, discountType, active} = req.body;
        let discountCode = await DiscountCode.findOne({code});
        if (discountCode) {
            return res.status(400).json({field: "code", message: "Code already exists."});
        }
        discountCode = await DiscountCode.create({
            code,
            description,
            minCost,
            discount,
            discountType,
            active
        });

        if (imageData) {
            const imageUrl = await cloudinaryAddImage(imageData, "DiscountCodes", discountCode._id.toString());

            discountCode.banner = {
                imageUrl: imageUrl,
                redirectTo,
                show: showBanner || false
            };

            await discountCode.save()
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.updateDiscountCode = async (req, res, next) => {
    try {
        const {code} = req.params;
        await DiscountCode.findOneAndUpdate({code}, req.body);
        req.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.deleteDiscountcode = async (req, res, next) => {
    try {
        const {code} = req.params;
        await DiscountCode.deleteOne({code});
        req.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
