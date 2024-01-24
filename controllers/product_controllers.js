const Product = require("../models/Product");
const Variant = require("../models/Variant");

const _exports = {};

_exports.getProducts =  async (req, res, next) => {
    try
    {
        const [query, offset, limit, sort] = Product.parseQuery(req.query);
        console.log(query, offset, limit, sort);
        const pipeline = [
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    _id: 0,
                    sku: '$_id',
                    product_id: '$product._id',
                    price: '$price.value',
                    currency: '$price.currency',
                    brand: '$product.brand',
                    sections: '$product.sections',
                    name: '$product.name',
                    color: '$color',
                    thumbnail: '$assets.thumbnail'
                }
            },
            {
                $match: query
            },
            {
                $group: {
                    _id: {
                        color: '$color',
                        product_id: '$product_id'
                    },
                    name: {$first: '$name'},
                    brand: {$first: '$brand'},
                    color: {$first: '$color'},
                    thumbnail: {$first: '$thumbnail'},
                    price: {$first: '$price'},
                    sku: {$first: '$sku'}
                }
            },
            {
                $project: {_id: 0}
            }
        ];
        if (sort) pipeline.push({$sort: sort});
        pipeline.push(
            {
                $skip: offset
            },
            {
                $limit: limit
            },

        )
        const products = await Variant.aggregate(pipeline);
        res.status(200).json(products);
    }
    catch(err)
    {
        res.sendStatus(500) && next(err);
    }
}

module.exports = _exports;