var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity');


var reg_email = /^[a-zA-Z0-9\.\+\-\_]+@[a-zA-Z0-9]+[a-zA-Z0-9\.\-\_]+[a-zA-Z]+$/i;
//var reg_uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

module.exports = function(req, res, next) {
    //req.body = req.query//テスト用

    if(!req.body.email||!req.body.password||!reg_email.test(req.body.email)){
        res.json(400, {});//不正リクエスト
        return;
    }

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
            // create the new user
            User.create({
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                secEmail: req.body.email,
                type: 'engineer',
                provider: 'local'
            }, function(err, user) {
                // handle error
                if (err) next(err);
                else {
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
                    // put user's id into session
                    req.session.userId = user.id;//auto login
                    res.json({"_id":user.id});
                }
            });
        }
    });
};