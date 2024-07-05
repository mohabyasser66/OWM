const User = require('../models/user');

module.exports = (...roles) => {
    return async (req, res, next) => {
        req.user = await User.findById(req.userId);
        if(!roles.includes(req.user.role)) {
            const error = new Error('You do not have permission to perform this action');
            error.statusCode = 403;
            next(error);
        }
        next();

    };
};