var Mailer = require('../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TempAccount = mongoose.model('TempAccount'),
    Activity = mongoose.model('Activity');

exports.index = function(req, res, next) {};

exports.new = function(req, res, next) {};

exports.show = function(req, res, next) {};

exports.create = function(req, res, next) {

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

exports.edit = function(req, res, next) {};

exports.update = function(req, res, next) {};

exports.destroy = function(req, res, next) {};

/*
    Activate temporary account
*/
exports.activate = function(req, res, next) {

    // find account by id in TempAccount collection
    TempAccount.findOne({
        _id: req.params.id
    }, function(err, tempAccount) {

        // handle error
        if (err) {
            next(err);
        }
        // if the target account not exists
        else if (!tempAccount) {
            res.status(404).send("Sorry, we can'f find register information of this account.");
        }
        // if the target account was found
        else {

            // create the new user
            User.create({
                email: tempAccount.email,
                password: tempAccount.password,
                firstName: tempAccount.firstName,
                lastName: tempAccount.lastName,
                secEmail: tempAccount.email,
                type: tempAccount.type,
                photo: './asset/images/no_photo_male.jpg',
                cover: './asset/images/default_cover.jpg',
                provider: 'local'
            }, function(err, user) {

                // handle error
                if (err) next(err);
                else {

                    // remove the temporary account
                    tempAccount.remove();

                    // send notification to administrator
                    User.find()
                        .select('email')
                        .where('type').equals('admin')
                        .where('logicDelete').equals(false)
                        .exec(function(err, admins) {
                            // send new-user mail
                            Mailer.newUser(admins, {
                                id: user._id,
                                name: user.firstName + ' ' + user.lastName
                            });
                        });

                    // log activity
                    Activity.create({
                        _owner: user._id,
                        type: 'user-activated'
                    }, function(err, activity) {
                        if (err) next(err);
                    });

                    // index user in solr
                    solr.add(user.toSolr(), function(err, solrResult) {
                        if (err) next(err);
                        else {
                            console.log(solrResult);
                            solr.commit(function(err,res){
                               if(err) console.log(err);
                               if(res) console.log(res);
                            });
                        }
                    });

                    // redirect to home page
                    res.redirect('/');
                }
            });
        }

    });

};
