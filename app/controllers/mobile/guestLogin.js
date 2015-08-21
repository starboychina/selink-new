var Mailer = require('../../mailer/mailer.js'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Notification = mongoose.model('Notification'),
    Message = mongoose.model('Message'),
    Activity = mongoose.model('Activity');

module.exports = function(req, res, next) {

  User.findById(req.body.tomoid, function(err, user) {

      if (err) next(err);
      else if (user == null) autoRegist(req, res, next)
      else {
          expandUserObject(user);
      }
  });

};

var autoRegist = function(req, res, next){

    var userinfo = {
        tomoid: req.body.tomoid,
        nickName: "匿名",
        gender: "女",
        type: 'engineer'
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

            expandUserObject(user);
        }
    });
}

var expandUserObject = function(user){
  // put user's id into session
  req.session.userId = user.id;
  // create query
  Notification.find()
      .select('_from type createDate')
      .where('_owner').equals(user.id)
      .where('type').equals('friend-invited')
      .where('confirmed').ne(user.id)
      .where('logicDelete').equals(false)
      .populate('_from', 'nickName photo')
      .exec(function(err, friendInvitations) {
          if (err) next(err);
          else {

              Message.find()
                  .select('_from createDate')
                  .where('_recipient').equals(user.id)
                  .where('opened').ne(user.id)
                  .where('logicDelete').ne(user.id)
                  .exec(function(err, newMessages) {
                      if (err) next(err);
                      else {

                          user = user.toObject();
                          user.friendInvitations = friendInvitations
                          user.newMessages = newMessages

                          res.json(200, user)
                      }
                  });
          }
      });
}
