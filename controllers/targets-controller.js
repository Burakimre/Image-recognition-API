let mongoose = require('mongoose');
Target = mongoose.model('Target');
let methods = {};

methods.index = function (req, res) {
    let limit = 2;
    let page = 1;
    if (req.query.page && req.query.page > 0)
        page = parseInt(req.query.page);

    Target.countDocuments({}, function (err, count) {
        if (err) {
            let response = {
                error: 'Error while retrieving targets, try again later.'
            };
            res.status(404);
            return res.render('admin/targets', response);
        }
        let maxPages = count > 0 ? Math.ceil(count / limit) : 0;
        if (page > maxPages)
            page = maxPages;

        let paginate = {
            limit: limit,
            skip: page > 0 ? (page - 1) * limit : 0
        };

        Target.find({}, {}, paginate, function (err, targets) {

            let pagination = [];
            let urlBase = req.baseUrl;
            if (maxPages > 0) {
                for (let i = 0; i <= maxPages + 1; i++) {
                    let obj = {};
                    if (i === 0) {
                        obj.label = 'Previous';
                        if (page > 1)
                            obj.url = `${urlBase}?page=${page - 1}`;
                    } else if (i === maxPages + 1) {
                        obj.label = 'Next';
                        if (page < maxPages)
                            obj.url = `${urlBase}?page=${page + 1}`;
                    } else {
                        obj.label = i.toString();
                        obj.url = `${urlBase}?page=${i}`;
                    }

                    obj.isActive = (page === i);
                    pagination.push(obj);
                }
            }

            let response = {
                error: req.flash('errorMsg'),
                targets: targets,
                page: page,
                pagination: pagination,
                maxPages: maxPages
            };

            if (err) {
                response = {
                    error: 'Error while retrieving targets, try again later.'
                }

                res.status(404);
            }

            res.render('admin/targets', response);
        });
    });
};

methods.create = function (req, res) {
    let message = {
        error: req.flash('errorMsg')
    };
    res.render('admin/create-target', message);
};

methods.details = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    Target.findById(query)
        .populate('submissions')
        .populate({
            path: 'submissions',
            populate: {
                path: 'user',
                model: 'User'
            }
        })
        .then(target => {
            if (target) {
                res.render('admin/details-target', {
                    target: target
                });
                return;
            }

            req.flash('errorMsg', 'Target not found: no target found with the given id.');
            res.redirect('/targets');
        })
        .catch(err => {
            req.flash('errorMsg', 'Target not found: id given is not a valid id.');
            res.redirect('/targets');
        });
};

methods.edit = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    Target.findById(query)
        .then(target => {
            if (target) {
                res.render('admin/update-target', {
                    target: target
                });
                return;
            }

            req.flash('errorMsg', 'Target not found: no target found with the given id.');
            res.redirect('/targets');
        })
        .catch(err => {
            req.flash('errorMsg', 'Target not found: id given is not a valid id.');
            res.redirect('/targets');
        });
};

module.exports = methods;
