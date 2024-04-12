const Variant = require("../models/Variant");
const Product = require("../models/Product");

module.exports.getProducts = async (req, res, next) => {
    try {
        const productQuery = Product.parseQuery(req.query);
        const productIds = (await Product.find(productQuery).select({ _id: 1 })).map(({ _id }) => _id);

        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        query.product = { $in: productIds };

        const [products, count] = await Promise.all([
            Variant.find(query).sort(sort || {}).skip(skip).limit(limit).populate('product', 'brand name').select({
                _id: 1,
                'assets.thumbnail': 1,
                price: 1
            }),
            Variant.countDocuments(query)
        ]);
        res.status(200).json({ products, pages: Math.ceil(count / limit), productCount: count });
    }
    catch (err) {
        res.sendStatus(500) && next(err);
    }
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
                {"product.name": regex},
                {"product.description": regex},
                {"product.brand": regex},
                {"product.section": regex},
                {color: regex}
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
            aggregation.push({$sort: sort});
        }
        aggregation.push(
            {
                $group: {
                    _id: null,
                    count: {$sum: 1},
                    products: {$push: "$$ROOT"}
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
            return res.status(200).json({products: [], pages: 0, productCount: 0});
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
        const variant = await Variant.findOneAndUpdate({ _id: variantId }, {$inc: {popularityIndex: 1}}).populate('product');
        if (!variant)
            return res.sendStatus(404)
        const id = variant.product._id
        const colors = await Variant.find({ product: id, _id: { $ne: variant._id } }).select({ color: 1, _id: 1, 'assets.thumbnail': 1 })
        res.status(200).json({ variant, colors })

    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
