const Variant = require("../models/Variant");
const Product = require("../models/Product");
const imageUpload = require("../utils/Imageupload");
const mongoose = require("mongoose");

module.exports.getProducts = async (req, res, next) => {
    try {
        const productQuery = Product.parseQuery(req.query);
        let [variantQuery, skip, limit, sort] = Variant.parseQuery(req.query);
        if (sort) {
            const tmpSort = {};
            for (const k in sort) {
                tmpSort['variants.' + k] = sort[k];
            }
            sort = tmpSort;
        }

        const pipeline = [
            {
                $match: productQuery
            },
            {
                $lookup: {
                    from: "variants",
                    let: { productId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                ...variantQuery,
                                $expr: {
                                    $and: [
                                        { $eq: ["$product", "$$productId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "products",
                                localField: "product",
                                foreignField: "_id",
                                as: "product"
                            }
                        },
                        { $unwind: "$product" },
                        {
                            $project: {
                                _id: 1,
                                product: {
                                    _id: "$product._id",
                                    name: "$product.name",
                                    brand: "$product.brand",
                                    section: "$product.section"
                                },
                                "assets.thumbnail": 1,
                                price: 1
                            }
                        }
                    ],
                    as: "variants"
                }
            },
            { $unwind: "$variants" },
            { $sort: sort || {'variants.popularity_index': -1}},
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    variants: { $push: "$variants" },
                    sortedVariants: {$push: "$sortedVariants"}
                }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    variants: { $slice: ["$variants", skip, limit] },
                    sortedVariants: 1
                }
            }
        ];

        const result = await Product.aggregate(pipeline);

        const [{ variants: products, count }] = result;

        res.status(200).json({ products, pages: Math.ceil(count / limit), productCount: count });
    }
    catch (err) {
        res.sendStatus(500) && next(err);
    }
    // try {
    //     const productQuery = Product.parseQuery(req.query);
    //     const productIds = (await Product.find(productQuery).select({ _id: 1 })).map(({ _id }) => _id);
    //
    //     const [query, skip, limit, sort] = Variant.parseQuery(req.query);
    //     query.product = { $in: productIds };
    //     const [products, count] = await Promise.all([
    //         Variant.find(query).sort(sort || {}).skip(skip).limit(limit).populate('product', 'brand name').select({
    //             _id: 1,
    //             'assets.thumbnail': 1,
    //             price: 1
    //         }),
    //         Variant.countDocuments(query)
    //     ]);
    //     res.status(200).json({ products, pages: Math.ceil(count / limit), productCount: count });
    // }
    // catch (err) {
    //     res.sendStatus(500) && next(err);
    // }
}

module.exports.searchProducts = async (req, res, next) => {
    try {
        const productQuery = Product.parseQuery(req.query);
        const search = req.params.search || "";
        const regex = { $regex: new RegExp(`.*${search.replace(/\s+/g, ".*")}.*`, 'i') };
        const [query, skip, limit, sort] = Variant.parseQuery(req.query);

        const match = {
            ...query,
            $or: [
                { "product.name": regex },
                { "product.description": regex },
                { "product.brand": regex },
                { "product.section": regex },
                { color: regex }
            ]
        };

        for (const k in productQuery) {
            match['product.' + k] = productQuery[k];
        }

        const aggregation = [
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $match: match
            },
        ];

        if (sort) {
            aggregation.push({ $sort: sort });
        }
        aggregation.push(
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    products: { $push: "$$ROOT" }
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        );

        const [data] = await Variant.aggregate(aggregation);
        if (!data) { //JUST IN CASE; ITS A FEATURE!!;
            return res.status(200).json({ products: [], pages: 0, productCount: 0 });
        }

        res.status(200).json({ products: data.products, pages: Math.ceil(data.count / limit), productCount: data.count });
    }
    catch (err) {
        res.sendStatus(500) && next(err);
    }
}


module.exports.getVariantInfo = async (req, res, next) => {
    try {
        const variantId = req.params.params;
        const variant = await Variant.findOneAndUpdate({ _id: variantId }, { $inc: { popularityIndex: 1 } }).populate('product');
        if (!variant)
        return res.sendStatus(404)
        const id = variant.product._id
        const colors = await Variant.find({ product: id, _id: { $ne: variant._id } }).select({ color: 1, _id: 1, 'assets.thumbnail': 1 })
        res.status(200).json({ variant, colors })

    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.getAllProducts = async (req, res, next) => {
    try {
        // const [query, skip, limit, sort] = Variant.parseQuery(req.query)

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const skip = (page - 1) * limit;

        const [products, count] = await Promise.all([Variant.find({}).sort({ section: 1 }).skip(skip).limit(limit).populate('product'), Variant.countDocuments()]);
        res.status(200).json({ products, pages: Math.ceil(count / limit), productCount: count })
    } catch (error) {
        res.sendStatus(500)
    }
}


module.exports.updateCrudProduct = async (req, res, next) => {
    try {
        const _id = req.body._id;
        const { name, description, section, brand } = req.body;
        const product = await Product.findByIdAndUpdate(_id, { name, description, section, brand }, { new: true });
        res.status(200).json(product);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeCrudProduct = async (req, res, next) => {
    try {
        const _id = req.body._id;
        console.log(_id)
        const product = await Product.findByIdAndDelete(_id, {});
        await Variant.deleteMany({ product: _id })

        res.status(200).json({ message: "product was deleted", product });
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.addCrudProduct = async (req, res, next) => {
    try {
        const { name, description, section, brand } = req.body;
        const product = await Product.create({ name, description, section, brand });
        res.status(200).json(product);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.updateCrudVariant = async (req, res, next) => {
    try {
        const _id = req.body._id;
        const { xsStock, sStock, mStock, lStock, xlStock, color, price, imageData } = req.body;


        const updateObject = { $inc: {}, $set: {} }
        if (xsStock) updateObject.$inc["stock.XS.stock"] = xsStock;
        if (sStock) updateObject.$inc["stock.S.stock"] = sStock;
        if (mStock) updateObject.$inc["stock.M.stock"] = mStock;
        if (lStock) updateObject.$inc["stock.L.stock"] = lStock;
        if (xlStock) updateObject.$inc["stock.XL.stock"] = xlStock;
        if (color) updateObject.$set["color"] = color;
        if (price) updateObject.$set["price.value"] = price;


        const variant = await Variant.findByIdAndUpdate(_id, updateObject,
            { new: true });


        if (!variant) {
            return (res.sendStatus(404)) && next(new Error("Variant not found"))
        }

        if (imageData) {
            const imageUrl = await imageUpload(imageData, variant.product, variant._id)

            variant.assets.thumbnail = imageUrl
            variant.assets.images = [imageUrl]

            await variant.save()
        }

        res.status(200).json(variant);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeCrudVariant = async (req, res, next) => {
    try {
        const _id = req.body._id;
        // const size = "M"
        const variant = await Variant.findByIdAndDelete(_id, {});

        // const variant = await Variant.findByIdAndUpdate(
        //     _id,
        //     { $set: { [`stock.${size}.stock`]: 0 } },
        //     { new: true });

        res.status(200).json({ message: `variant with id: ${_id} successfully deleted!` });
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.addCrudVariant = async (req, res, next) => {
    try {
        const { _id, xsStock, sStock, mStock, lStock, xlStock, color, price, imageData } = req.body;
        console.log(imageData)

        const variant = await Variant.create({
            "product": new mongoose.Types.ObjectId(_id),
            "stock.XS.stock": xsStock,
            "stock.S.stock": sStock,
            "stock.M.stock": mStock,
            "stock.L.stock": lStock,
            "stock.XL.stock": xlStock,
            color,
            "price.value": price,
        });

        const imageUrl = await imageUpload(imageData, variant.product, variant._id)

        variant.assets.thumbnail = imageUrl
        variant.assets.images = [imageUrl]

        await variant.save()

        res.status(200).json(variant);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

