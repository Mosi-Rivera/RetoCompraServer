module.exports.validateRole = (validRoles = []) => {
    return (req, res, next) => {
        const role = req.userRole;
        if (!validRoles.includes(role)) {
            res.sendStatus(403);
        } else {
            next();
        }
    }
}
