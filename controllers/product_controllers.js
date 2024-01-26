const Variant = require("../models/Variant");

const _exports = {};

_exports.getProducts =  async (req, res, next) => {
    try
    {
        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        const products = await Variant.find(query).sort(sort || {}).skip(skip).limit(limit).select({
            _id: 1,
            product: 1,
            'assets.thumbnail': 1,
            name: 1,
            brand: 1,
            price: 1
        });
        res.status(200).json(products);
    }
    catch(err)
    {
        res.sendStatus(500) && next(err);
    }
}

_exports.searchProducts = async (req, res, next) => {
    try
    {
        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        const search = req.params.search;
        const regex = { $regex: new RegExp(`.*${search}.*`, 'i') };
        const products = await Variant.find({
            $or: [
                {name: regex},
                {brand: regex},
                {section: regex},
                {color: regex}
            ],
            ...query
        }).sort(sort || {}).skip(skip).limit(limit).select({
            _id: 1,
            product: 1,
            'assets.thumbnail': 1,
            name: 1,
            brand: 1,
            price: 1,
            color: 1
        });
        res.status(200).json(products);
    }
    catch(err)
    {
        res.sendStatus(500) && next(err);
    }
}

module.exports = _exports;