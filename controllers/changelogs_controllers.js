const ChangeLog = require("../models/change_log");
const { parseInputStrToInt } = require("../utils/input");

module.exports.getChanglogsController = async (req, res, next) => {
    try {
        let {documentType, documentId, userId, page, limit} = req.query;
        page = parseInputStrToInt(page, 1);
        limit = parseInputStrToInt(limit, 20);
        const skip = (page - 1) * limit;

        const queryObj = {};
        if (documentType) {
                queryObj[documentType] = documentId || {$exists: true};
        }
        if (userId) {
            queryObj.userId = userId;
        }

        const [logs, count] = await Promise.all([
            ChangeLog.find(queryObj).skip(skip).limit(limit),
            ChangeLog.estimatedDocumentCount(queryObj)
        ]);

        res.status(200).json({logs, pages: Math.ceil(count / limit), count});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
