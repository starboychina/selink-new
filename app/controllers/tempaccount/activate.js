/*
    Activate temporary account
*/
var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    TempAccount = mongoose.model('TempAccount'),
    Activity = mongoose.model('Activity');

module.exports = function(req, res, next) {

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
                tomoid: tempAccount.email,
                password: tempAccount.password,
                firstName: tempAccount.firstName,
                lastName: tempAccount.lastName,
                secEmail: tempAccount.email,
                type: tempAccount.type,
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