const Variant = require('../models/Variant');
const ChangeLog = require("../models/change_log");

module.exports.getChanglogsController = async (req, res, next) => {
    try {
        const {documentType, documentId} = req.query;
        delete req.query.documentType;
        delete req.query.documentId;

        const [query, skip, limit, sort] = Variant.parseQuery(req.query);
        if (documentType) {
                query[documentType] = documentId || {$exists: true};
        }

        const [logs, count] = await Promise.all([
            ChangeLog.find(query).skip(skip).limit(limit).sort(sort || {})
            .populate('userId', 'email role _id')
            .populate('product', '_id name section brand')
            .populate('variant', '_id product')
            .populate('user', '_id email role')
            .populate('order', '_id'),
            ChangeLog.estimatedDocumentCount(query)
        ]);

        res.status(200).json({logs, pages: Math.ceil(count / limit), count});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
