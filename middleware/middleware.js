let methods = {
    hasAccess: function (accessLevel) {
        return function (req, res, next) {
            let loggedIn = req.isAuthenticated();
            let hasAccess = false;
            if (loggedIn) {
                hasAccess = req.user.hasAccess(accessLevel);
            }

            if (loggedIn && hasAccess) {
                return next();
            } else if (loggedIn && !hasAccess) {
                res.status(403);
                return res.json({
                    success: false,
                    error: 'Forbidden'
                });
            }

            res.status(401);
            return res.json({
                success: false,
                error: 'Unauthorized'
            });
        }
    }
};
module.exports = methods;
