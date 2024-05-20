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
        res.status(200).json(await DiscountCode.findOne({code}));
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.getDiscountTexts = async (req, res, next) => {
    try {
        const texts = await DiscountCode.find({active: true}, {text: 1});
        res.status(200).json(texts);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.isValidDiscount = async (req, res, next) => {
    try {
        const {code} = req.query;
        console.log(code);
        const discount = await DiscountCode.findOne({active: true, code: code}, {code: 1, discount: 1, discountType: 1, minCost: 1});
        res.status(200).json(discount);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.getDiscountBanners = async (req, res, next) => {
    try {
        const banners = await DiscountCode.find({active: true, imageUrl: {$exists: true}}, {redirectTo: 1, description: 1, code: 1, imageUrl: 1});
        res.status(202).json(banners);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.createDiscountCode = async (req, res, next) => {
    try {
        const {imageData, redirectTo, code, description, minCost, discount, discountType, active} = req.body;
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
            active,
            redirectTo
        });

        if (imageData) {
            const imageUrl = await cloudinaryAddImage(imageData, "DiscountCodes", discountCode._id.toString());
            discountCode.imageUrl = imageUrl;
            discountCode.save()
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.updateDiscountCode = async (req, res, next) => {
    try {
        const {code} = req.params;
        const {imageData} = req.body;
        delete req.body.imageData;
        delete req.body.code;

        const discountCode = await DiscountCode.findOneAndUpdate({code}, req.body, {new: true});
        if (!discountCode) {
            return res.sendStatus(400) && next(new Error("Error: Code not found."));
        }
        if (imageData) {
            const imageUrl = await cloudinaryAddImage(imageData, "DiscountCodes", discountCode._id.toString());
            discountCode.imageUrl = imageUrl;
            discountCode.save();
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.deleteDiscountcode = async (req, res, next) => {
    try {
        const {id} = req.params;
        await DiscountCode.deleteOne({_id: id});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
