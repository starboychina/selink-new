// Create new sub document
var mongoose = require('mongoose'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {

  User.findOneById(req.params.id, {"_id":true,"friends":true}, function(err, user) {

      console.log("***test login with: ")
      console.log(user)

      if (err) next(err);
      else if (user == null) res.json(404,req.body)
      else {
          // put user's id into session
          req.session.userId = user.id;
          // send success signal
          res.json(200,user);
      }
  });

};
