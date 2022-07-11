let isImageUrl = require('is-image-url');
let request = require('request-promise');
let mongoose = require('mongoose');
let errorHandler = require('../helpers/errorhandler.js');
Submission = mongoose.model('Submission');
Target = mongoose.model('Target');
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

methods.store = async function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    if (!isImageUrl(req.body.image_url)) {
        return errorHandler.throw400(req, res, "Given url is not an image");
    }

    let apikey = {};
    if (req.query.api_key) {
        apikey._id = req.query.api_key.toLowerCase();
    } else if (req.body.api_key) {
        apikey._id = req.body.api_key.toLowerCase();
    } else {
        return errorHandler.throw401(req, res, 'Api key is required');
    }

    await Target.findById(query)
        .then(async (target) => {
            let newSubmission = new Submission();

            User.findById(apikey)
                .then(user => {
                    if (user) {
                        newSubmission.user = user.id;
                    } else {
                        return errorHandler.throw401(req, res, 'Invalid api key given');
                    }
                }).catch(err => {
                    return errorHandler.throw401(req, res, 'Invalid api key given');
                });
            newSubmission.imageUrl = req.body.image_url;
            newSubmission.target = target.id;

            options.qs.image_url = newSubmission.imageUrl;

            await request(options)
                .then((result) => {
                    let tags = result.result.tags;

                    tags.forEach(tag => {
                        newSubmission.tags.push({
                            confidence: tag.confidence,
                            tag: tag.tag.en
                        });
                    });
                }).catch(function (err) {
                    return errorHandler.throwError(req, res, err);
                });

            // Calculation
            let score = 0;
            let scoreTarget = 0;
            let acceptableConfidence = 0.3;

            target.tags.forEach(targetTag => {
                newSubmission.tags.forEach(submissionTag => {
                    if (targetTag.tag === submissionTag.tag) {
                        // Increment if confidence comparison is within 30% difference
                        if ((targetTag.confidence * (1 - acceptableConfidence)) <= submissionTag.confidence && (targetTag.confidence * (1 + acceptableConfidence)) >= submissionTag.confidence) {
                            score += submissionTag.confidence;
                        }
                    }
                });

                scoreTarget += targetTag.confidence;
            });

            if (score == 0 && scoreTarget == 0) {
                score = 0;
            } else {
                score = score / scoreTarget * 100;
            }

            newSubmission.score = score;

            await newSubmission.save().then(newSubmission => {
                target.submissions.push(newSubmission);
                target.save()
                    .then(target => {
                        res.json({
                            message: 'Submission received successfully',
                            target: target.tags,
                            submission: newSubmission.tags
                        });
                    })
                    .catch(function (err) {
                        return errorHandler.throwError(req, res, err);
                    });
            });
        })
        .catch(err => {
            if (err.errors && err.errors.imageUrl !== undefined) {
                return errorHandler.throw400(req, res, err.errors.imageUrl.message);
            }

            return errorHandler.throw404(req, res);
        });
};

methods.getSubmissions = function (req, res) {
    Submission.find({}, function (err, targets) {
        if (err) {
            return errorHandler.throwError(req, res, err);
        }
        res.json(targets);
    }).catch(error => {
        console.log(error);
    });
};

methods.getSubmission = function (req, res) {
    let query = {};
    if (req.params.id) {
        query._id = req.params.id.toLowerCase();
    }

    Submission.findById(query)
        .then(target => {
            return res.json(target);
        })
        .catch(() => {
            return errorHandler.throw404(req, res);
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
    } else {
        currentUserId = null;
    }

    User.findById(currentUserId)
        .then(user => {
            if (user) {
                let submissionData = {};
                submissionData._id = req.params.id;

                if (user.role != 'admin') {
                    submissionData.user = currentUserId;
                }

                Submission.deleteOne(submissionData).catch((err) => {
                    console.log(err);
                });

                if (req.user && (req.query.api_key === req.user._id || req.body.api_key === req.user._id)) {
                    res.status(200);
                    let route = req.header('Referer') || '/targets';
                    return res.redirect(route);
                } else {
                    return errorHandler.throw200(req, res , 'Submission deleted')
                }
            } else {
                return errorHandler.throw401(req, res, 'Invalid api key given');
            }
        }).catch(err => {
            return errorHandler.throw401(req, res, 'Invalid api key given');
        });
}

module.exports = methods;
