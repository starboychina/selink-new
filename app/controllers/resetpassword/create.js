var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    ResetPassword = mongoose.model('ResetPassword');

module.exports = function(req, res, next) {

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
