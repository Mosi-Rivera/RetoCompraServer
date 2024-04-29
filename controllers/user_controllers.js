const User = require('../models/user');
const { parseInputStrToInt } = require('../utils/input');

module.exports.getUsers = async (req, res, next) => {
    try {
        let {limit, page, sort, email} = req.query;
        delete req.query.limit;
        delete req.query.page;
        delete req.query.sort;
        delete req.query.email;
        limit = parseInputStrToInt(limit, 25);
        page = parseInputStrToInt(page, 1);
        page = page <= 0 ? 1 : page;
        
        switch (sort) {
            case 'old': sort = {createdAt: 1}; break;
            default: sort = {createdAt: -1}; break;
        }

        const pipeline = [
            {$match: req.query},
            {$sort: sort || {createdAt: -1}},
            {$project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                role: 1,
                createdAt: 1
            }},
        ];
        if (email) {
            pipeline.push({$match: {
                'email': { $regex: new RegExp(`.*${email.replace(/\s+/g, ".*")}.*`, 'i') }
            }});
        }
        pipeline.push(
            {$group: {
                _id: null,
                count: {$sum: 1},
                users: {$push: '$$ROOT'}
            }},
            {
                $project: {
                    count: 1,
                    users: {$slice: ["$users", (page - 1) * limit, limit]}
                }
            }
        );

        const [result] = await User.aggregate(pipeline);
        if (!result) {
            return res.status(200).json({users: [], count: 0, pages: 0});
        }
        const {users, count} = result;
        res.status(200).json({users, count, pages: Math.ceil(count / limit)});
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}

module.exports.setUserRole = async (req, res, next) => {
    try {
        const {user_id, role} = req.body;
        const user_modified = await User.findByIdAndUpdate(user_id, {$set: {role}})
        if (!user_modified) {
            return res.sendStatus(404) && next(new Error('User not found.'));
        }

        const user = (await User.findOne({email: req.email}));
        if (user) {
            ChangeLog.userModify(
                user._id,
                user_modified._id,
                {roleChangedTo: role}
            );
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500) && next(error);
    }
}
