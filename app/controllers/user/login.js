// User login
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Notification = mongoose.model('Notification'),
    Message = mongoose.model('Message'),
    Activity = mongoose.model('Activity');

module.exports = function(req, res, next) {

    // do nothing if login info are not enough
    if ( (!req.body.tomoid && !req.body.email) || !req.body.password)
        res.json(400, {});

    // look up user info
    User.findOne(req.body, function(err, user) {

        // pass if error happend
        if (err) next(err);
        // if the account not found, return the fail message
        else if (!user) res.json(401, {});
        // if account could be found
        else {

            // put user's id into session
            req.session.userId = user.id;

            // create activity
            Activity.create({
                _owner: user.id,
                type: 'user-login'
            }, function(err, activity) {
                if (err) next(err);
            });

            user.friends.forEach(function(room) {
                sio.sockets.in(room).emit('user-login', {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photo_ref: user.photo_ref
                });
            });

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

                                    res.json(user)
                                }
                            });
                    }
                });
        }
    });
};
