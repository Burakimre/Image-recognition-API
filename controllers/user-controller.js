let methods = {};

methods.index = function(req, res) {
    res.render('profile', {
        user: req.user
    });
};

module.exports = methods;
