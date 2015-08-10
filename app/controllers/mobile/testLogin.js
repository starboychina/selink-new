// Create new sub document
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Notification = mongoose.model('Notification'),
    Message = mongoose.model('Message');

module.exports = function(req, res, next) {

  User.findById(req.query.id, function(err, user) {

      if (err) next(err);
      else if (user == null) res.json(404,req.body)
      else {
          // put user's id into session
          req.session.userId = user.id;

          Notification.count()
              .where('_owner').equals(user.id)
              .where('type').equals('friend-invited')
              .where('confirmed').ne(user.id)
              .where('logicDelete').equals(false)
              .exec(function(err, notiCount) {
                  if (err) next(err);
                  else {

                      Message.count()
                          .where('_recipient').equals(user.id)
                          .where('opened').ne(user.id)
                          .where('logicDelete').ne(user.id)
                          .exec(function(err, msgCount) {
                              if (err) next(err);
                              else {

                                  user = user.toObject();
                                  user.notificationCount = notiCount + msgCount
                                  res.json(200, user)
                              }
                          });
                  }
              });
      }
  });

};
