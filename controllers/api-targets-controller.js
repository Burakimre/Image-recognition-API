let request = require('request-promise');
let mongoose = require('mongoose');
let formidable = require('formidable');
let imgur = require('imgur');
let fs = require('fs');
let errorHandler = require('../helpers/errorhandler');
let isImageUrl = require('is-image-url');
Target = mongoose.model('Target');
Submission = mongoose.model('Submission');
User = mongoose.model('User');

let methods = {};
let options = {
    uri: 'https://api.imagga.com/v2/tags',
    method: 'GET',
    qs: {
        image_url: undefined,
    },
    headers: {
        "User-Agent": "Request-Promise",
        "Content-Type": "application/json"
    },
    json: true,
    auth: {
        user: process.env.IMAGGA_API_KEY,
        pass: process.env.IMAGGA_API_SECRET
    }
};

methods.getTargets = function (req, res) {
    let query = {};
    if (req.query.name)
        query.name = new RegExp(req.query.name, "i");
    if (req.query.description)
        query.description = new RegExp(req.query.description, "i");

    let paginate = {
        limit: 2,
        skip: 0
    };
    if (req.query.limit)
        paginate.limit = parseInt(req.query.limit);
    if (req.query.offset)
        paginate.skip = parseInt(req.query.offset);

    Target.count({}, function (err, count) {
        if (err) {
            let response = {
                error: 'Error while retrieving targets, try again later.'
            };

            return res.render('admin/targets', response);
        }

        Target.find(query, {}, paginate, function (err, targets) {
            let response = {
                count: count,
                targets: targets,
                prev: null,
                next: null
            };
            let limit = paginate.limit;
            if (paginate.skip - paginate.limit >= 0) {
                let offset = paginate.skip - paginate.limit;
                response.prev = `${req.baseUrl}?offset=${offset}&limit=${limit}`;
            }

            if (paginate.skip + paginate.limit <= count) {
                let offset = paginate.skip + paginate.limit;
                response.next = `${req.baseUrl}?offset=${offset}&limit=${limit}`;
            }
            res.json(response);
        });
    });
};

methods.getTarget = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    Target.findById(query)
        .then(target => {
            if (target) {
                return res.json(target);
            }
        })
        .catch(err => {
            return errorHandler.throw404(req, res);
        });
};

methods.getSubmissions = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    Target.findById(query)
        .populate('submissions')
        .populate({
            path: 'submissions',
        })
        .then(target => {
            if (target) {
                return res.json(target.submissions);
            }
        })
        .catch(err => {
            return errorHandler.throw404(req, res);
        });
};

methods.getSubmission = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }
    let match = {};
    if (req.params.submission_id) {
        match._id = req.params.submission_id.toLowerCase();
    }
    Target.findById(query)
        .populate('submissions')
        .populate({
            path: 'submissions',
            match: match
        })
        .then(target => {
            if (target) {
                Submission.findById(match)
                    .then(submission => {
                        if (submission)
                            return res.json(submission);
                        return errorHandler.throw404(req, res);
                    })
                    .catch(err => {
                        return errorHandler.throw404(req, res);
                    });
            }
        })
        .catch(err => {
            return errorHandler.throw404(req, res);
        });
};

methods.getSubmissionTags = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }
    let match = {};
    if (req.params.submission_id) {
        match._id = req.params.submission_id.toLowerCase();
    }
    Target.findById(query)
        .populate('submissions')
        .populate({
            path: 'submissions',
            match: match
        })
        .then(target => {
            if (target) {
                Submission.findById(match)
                    .then(submission => {
                        if (submission)
                            return res.json(submission.tags);
                        return errorHandler.throw404(req, res);
                    })
                    .catch(err => {
                        return errorHandler.throw404(req, res);
                    });
            }
        })
        .catch(err => {
            return errorHandler.throw404(req, res);
        });
};

methods.getSubmissionTag = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }
    let match = {};
    if (req.params.submission_id) {
        match._id = req.params.submission_id.toLowerCase();
    }
    let name = '';
    if (req.params.name) {
        name = req.params.name.toLowerCase();
    }
    Target.findById(query)
        .populate('submissions')
        .populate({
            path: 'submissions',
            match: match
        })
        .then(target => {
            if (target) {
                Submission.findById(match)
                    .then(submission => {
                        if (submission) {
                            let tag = submission.tags.find(tag => tag.tag.toLowerCase() === name);
                            if (tag) {
                                return res.json(tag);
                            } else {
                                return errorHandler.throw404(req, res);
                            }
                        } else {
                            return errorHandler.throw404(req, res);
                        }
                    })
                    .catch(err => {
                        return errorHandler.throw404(req, res);
                    });
            } else {
                return errorHandler.throw404(req, res);
            }
        })
        .catch(err => {
            return errorHandler.throw404(req, res);
        });
};

methods.store = function (req, res) {
    new formidable.IncomingForm().parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error', err);
            throw err;
        }

        let newTarget = new Target();

        newTarget.name = fields.targetName;
        newTarget.description = fields.targetDescription;
        if (fields.api_key) {
            newTarget.creator = fields.api_key;
        } else {
            newTarget.creator = req.user.id;
        }

        // Image File
        if (files.targetImage) {
            if (files.targetImage.size > 0) {
                await imgur.uploadBase64(base64_encode(files.targetImage.path))
                    .then(function (json) {
                        newTarget.imageUrl = json.data.link
                    })
                    .catch(function (err) {
                        console.error(err.message);
                    });

                options.qs.image_url = newTarget.imageUrl;
            }
        }

        // Image URL
        if (isImageUrl(fields.image_url)) {
            newTarget.imageUrl = fields.image_url;
            options.qs.image_url = newTarget.imageUrl;
        }

        if (files.targetImage || fields.image_url) {
            await request(options)
                .then(function (result) {
                    let tags = result.result.tags;

                    tags.forEach(tag => {
                        newTarget.tags.push({
                            confidence: tag.confidence,
                            tag: tag.tag.en
                        });
                    });
                })
                .catch(function (err) {
                    console.error(err.message);
                });
        }

        await newTarget.save().then(() => {
            if (files.targetImage) {
                res.redirect(301, '/targets');
            } else if (fields.image_url) {
                res.status(201).end();
            }

        }).catch(function (err) {
            // Error redirecting...
            let errorMessageList = [];

            if (err.errors.name !== undefined) {
                errorMessageList.push(err.errors.name.message);
            }

            if (err.errors.description !== undefined) {
                errorMessageList.push(err.errors.description.message);
            }

            if (err.errors.imageUrl !== undefined) {
                errorMessageList.push(err.errors.imageUrl.message);
            }

            if (errorMessageList.length > 0) {
                let errorMessage = "<ul>";

                errorMessageList.forEach(message => {
                    errorMessage += `<li>${message}</li>`
                });

                errorMessage += "</ul>";
                req.flash('errorMsg', errorMessage);
                return res.redirect(422, '/targets/new');
            } else {
                return res.redirect(422, '/targets/new');
            }
        });
    });
};

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

methods.update = function (req, res) {
    new formidable.IncomingForm().parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Error', err);
            throw err;
        }

        let query = {};
        if (req.params.id) {
            query._id = req.params.id.toLowerCase();
        }

        let errorMessageList = [];

        if (!fields.targetName) {
            errorMessageList.push('You must enter a name.');
        }

        if (!fields.targetDescription) {
            errorMessageList.push('You must enter a description.');
        }

        if (errorMessageList.length > 0) {
            let errorMessage = "<ul>";

            errorMessageList.forEach(message => {
                errorMessage += `<li>${message}</li>`
            });

            errorMessage += "</ul>";
            req.flash('errorMsg', errorMessage);
            return res.redirect(422, '/targets/' + query._id + '/edit');
        }

        let newData = {
            name: fields.targetName,
            description: fields.targetDescription
        };
        Target.findOneAndUpdate(query, newData, {
                new: true,
                useFindAndModify: false
            })
            .then(target => {
                if (!target) {
                    req.flash('errorMsg', 'Target not found: no target found with the given id.');
                }
            })
            .catch(err => {
                req.flash('errorMsg', 'Target not found: id given is not a valid id.');
                return res.redirect(422, '/targets');
            });
        return res.redirect(301, '/targets');
    });
};

methods.delete = function (req, res) {
    let currentUserId;

    if (req.query.api_key) {
        currentUserId = req.query.api_key;
    } else if (req.body.api_key) {
        currentUserId = req.body.api_key;
    } else if (req.user && req.user._id) {
        currentUserId = req.user._id;
    }
    else {
        currentUserId = null;
    }

    User.findById(currentUserId)
        .then(user => {
            if (user) {
                if (user.role == 'admin') {
                    Target.findOneAndRemove({
                        _id: req.params.id
                    }, null , function (err, item) {
                        if(err) {
                            return errorHandler.throwError(req, res, err);
                        }

                        if(!item) {
                            return errorHandler.throw404(req, res);
                        }

                        Submission.deleteMany({
                            target: req.params.id
                        }).then(() => {
                            if (req.user && (req.query.api_key === req.user._id || req.body.api_key === req.user._id)) {
                                res.status(200);
                                return res.redirect('/targets');
                            } else {
                                return errorHandler.throw200(req, res, 'Target deleted');
                            }
                        }).catch(err =>  { return errorHandler.throwError(req, res, err); });
                    });
                } else {
                    return errorHandler.throw401(req, res, 'Only admins can delete targets');
                }
            } else {
                return errorHandler.throw401(req, res, 'Invalid api key given');
            }
        }).catch(err => {
            return errorHandler.throw401(req, res, 'Invalid api key given');
        });
}

module.exports = methods;
