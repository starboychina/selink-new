var Mailer = require('../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ResetPassword = mongoose.model('ResetPassword');

exports.show = function(req, res, next) {

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

exports.create = function(req, res, next) {

    User.findOne({
        email: req.body.email
    }, function(err, user) {

        if (err) next(err);
        else if (!user) res.json(404, {});
        else {

            ResetPassword.create(req.body, function(err, resetpassword) {

                // handle error
                if (err) {
                    if (err.code == 11000) res.json(409, {});
                    else next(err);
                } else {

                    // send user-activate mail
                    Mailer.resetPassword(resetpassword);

                    console.log("http://localhost:8081/retrieve/" + resetpassword._id);

                    res.json({});
                }

            });
        }
    });
};

exports.update = function(req, res, next) {

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