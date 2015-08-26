var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TempAccount = mongoose.model('TempAccount');

module.exports = function(req, res, next) {

    // try to find a account by the user applicated account ID
    User.findOne({
        email: req.body.email
    }, function(err, user) {

        // handle error
        if (err) {
            next(err);
        }
        // if a existed account are found, require another ID
        else if (user) {
            res.json(409, {});
        }
        // for valid account ID
        else {
            // save temp account object
            TempAccount.create(req.body, function(err, tempAccount) {
                // handle error
                if (err) {
                    if (err.code == 11000)
                        res.json(409, {});
                    else next(err);
                } else {

                    // send account-activate mail
                    Mailer.accountActive({
                        id: tempAccount._id,
                        email: req.body.email
                    });

                    console.log("http://localhost:8081/activate/" + tempAccount._id);

                    // send success singnal
                    res.json({});
                }
            });
        }
    });
};
