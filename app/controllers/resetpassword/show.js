var ResetPassword = require('mongoose').model('ResetPassword');

module.exports = function(req, res, next) {

    // find account by id in ResetPassword collection
    ResetPassword.findOne({
        _id: req.params.id
    }, function(err, resetPassword) {

        // handle error
        if (err) next(err);
        // if the target account not exists
        else if (!resetPassword) next();
        // if the target account was found
        else {
            // send the password reset page
            res.render('retrieve', resetPassword);
        }
    });
};