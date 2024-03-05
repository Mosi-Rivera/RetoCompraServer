const Variant = require("../models/Variant");
const Product = require("../models/Product");

module.exports.getProducts =  async (req, res, next) => {
    try
    {
        const productQuery = Product.parseQuery(req.body);
        const productIds = (await Product.find(productQuery).select({ _id: 1})).map( ({_id}) => _id );

        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        query.product = {$in: productIds};

        const [products, count] = await Promise.all([
            Variant.find(query).sort(sort || {}).skip(skip).limit(limit).populate('product', 'brand name').select({
                _id: 1,
                'assets.thumbnail': 1,
                price: 1
            }),
            Variant.countDocuments(query)
        ]);
        res.status(200).json({products, pages: Math.ceil(count / limit), productCount: count});
    }
    catch(err)
    {
        res.sendStatus(500) && next(err);
    }
}

module.exports.searchProducts = async (req, res, next) => {
    try
    {
        const productQuery = Product.parseQuery(req.query);
        const search = req.params.search || "";
        const regex = { $regex: new RegExp(`.*${search.replace(/\s+/g, ".*")}.*`, 'i') };

        productQuery.$or = [
                    {name: regex},
                    {description: regex},
                    {brand: regex},
        ];
        const productIds = (await Product.find(productQuery).select({ _id: 1})).map( ({_id}) => _id );
        console.log(productIds, productQuery);

        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        query.$or = [
            {product: {$in: productIds}},
            {color: regex}
        ];

        const [products, count] = await Promise.all([
            Variant.find({
                ...query
            }).sort(sort || {}).skip(skip).limit(limit).populate("product", "brand name").select({
                _id: 1,
                'assets.thumbnail': 1,
                name: 1,
                price: 1,
                color: 1
            }),
            Variant.countDocuments(query)
        ]);
        res.status(200).json({products, pages: Math.ceil(count / limit), productCount: count});
    }
    catch(err)
    {
        res.sendStatus(500) && next(err);
    }
}
