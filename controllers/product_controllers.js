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

        productQuery.$or = [
            { name: regex },
            { description: regex },
            { brand: regex },
            { section: regex }
        ];
        const productIds = (await Product.find(productQuery).select({ _id: 1 })).map(({ _id }) => _id);

        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        query.$or = [
            { product: { $in: productIds } },
            { color: regex }
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
        res.status(200).json({ products, pages: Math.ceil(count / limit), productCount: count });
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
        res.sendStatus(500)
    }
}

module.exports.updateCrudProduct = async (req, res, next) => {
    try {
        const  _id = req._id;
        const {name, description, section, brand} = req.body;
        const user = await Product.findByIdAndUpdate({_id},{name, description, section, brand}, {});
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeCrudProduct = async (req, res, next) => {
    try {
        const  _id = req._id;
        const {name, description, section, brand} = req.body;
        const user = await Product.findByIdAndDelete({_id},{name, description, section, brand}, {});
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
 }

 module.exports.addCrudProduct = async (req, res, next) => {
    try {
        const {name, description, section, brand} = req.body;
        const user = await Product.create({name, description, section, brand});
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
 }

 module.exports.updateCrudVariant = async (req, res, next) => {
    try {
        const  _id = req._id;
        const {stock,color, price, assets} = req.body;
        const user = await Variant.findByIdAndUpdate({_id},{udpate: stock,color, price, assets}, {});
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.removeCrudVariant = async (req, res, next) => {
    try {
        const  _id = req._id;
        const {stock,color, price, assets} = req.body;
        const user = await Variant.findByIdAndDelete({_id},{stock,color, price, assets}, {});
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
 }

 module.exports.addCrudVariant = async (req, res, next) => {
    try {
        const {stock,color, price, assets} = req.body;
        const user = await Variant.varAdd( stock,color, price, assets);
        res.status(200).json(user);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
 }