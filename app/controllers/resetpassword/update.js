var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ResetPassword = mongoose.model('ResetPassword');

module.exports = function(req, res, next) {

    ResetPassword.findOne({
        _id: req.params.id
    }, function(err, resetPassword) {

        // handle error
        if (err) next(err);
        // if the target account not exists
        else if (!resetPassword) res.json(404, {});
        // if the target account was found
        else {

            User.findOneAndUpdate({
                email: resetPassword.email
            }, {
                password: req.body.password
            }, function(err, account) {

                if (err) next(err);
                else {
                    resetPassword.remove();
                    res.json({});
                }
            });
        }
    });
};