var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity');


var reg_email = /^[a-zA-Z0-9\.\+\-\_]+@[a-zA-Z0-9]+[a-zA-Z0-9\.\-\_]+[a-zA-Z]+$/i;
//var reg_uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

module.exports = function(req, res, next) {

    if(!req.body.openid || !req.body.access_token){
        res.json(400, {});
        return;
    }

    var userinfo = {
        tomoid: req.body.tomoid,
        nickName: req.body.nickName,
        openids: [{
          type: "wechat",
          openid: req.body.openid
        }],
        type: 'engineer',
        provider: 'wechat'
    };

    // create the new user
    User.create(userinfo, function(err, user) {
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

};
