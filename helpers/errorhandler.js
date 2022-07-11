let methods = {};

methods.throw404 = function (req, res){
    let resp = {
        status: 404,
        message: 'Error resource not found'
    };

    res.status(resp.status);
    return res.json(resp);
};

methods.throw400 = function (req, res, err_desc) {
    let resp = {
        status: 400,
        message: 'Bad request',
        error_description: err_desc
    };

    res.status(resp.status);
    return res.json(resp);
};

methods.throw401 = function (req, res, err_desc) {
    let resp = {
        status: 401,
        message: 'Authentication required',
        error_description: err_desc
    };

    res.status(resp.status);
    return res.json(resp);
};

methods.throwError = function (req, res, err) {
    let resp = {
        status: req.status,
        message: err.message
    };

    res.status(resp.status);
    return res.json(resp);
};


methods.throw200 = function (req, res, message) {
    let resp = {
        status: 200,
        message: message,
    };

    res.status(resp.status);
    return res.json(resp);
};

module.exports = methods;
