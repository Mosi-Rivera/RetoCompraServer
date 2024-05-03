const isEmailVerified = (req, res, next) => {
    try {
        const {emailVerified} = req;
        if (emailVerified) {
            next();
        } else {
            throw new Error("Email is not verified.");
        }
    } catch (error) {
        res.sendStatus(403) && next(error);
    }
}

module.exports = isEmailVerified;
