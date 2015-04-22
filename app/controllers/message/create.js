var _ = require('underscore'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Message = mongoose.model('Message'),
    Mailer = require('../../mailer/mailer.js'),
    push = require('../../utils/push');

module.exports = function(req, res, next) {

    _.extend(req.body, {_from: req.user.id, _recipient: req.body.recipient});

    Message.create(req.body, function(err, message) {

        if (err) next(err);
        else {

            // log user's activity
            Activity.create({
                _owner: req.user.id,
                type: 'message-new',
                targetMessage: message._id
            }, function(err) {
                if (err) next(err);
            });

            // populate the message with user's info
            message.populate({path:'_from', select: 'type firstName lastName title cover photo createDate'}, function(err, msg) {

                if(err) next(err);
                // send real time message
                else {

                    msg._recipient.forEach(function(room) {
                        sio.sockets.in(room).emit('message-new', msg);
                    });

                    // push
                    User.find()
                        //.select('email')
                        .where('_id').in(msg._recipient)
                        .where('logicDelete').equals(false)
                        .exec(function(err, users) {
                            for (var i = users.length - 1; i >= 0; i--) {
                                if(!isUserOnline(users[i].id)){
                                    for (var j = users[i].devices.length - 1; j >= 0; j--) {
                                        if(users[i].devices[j].token){
                                            var token = users[i].devices[j].token;
                                            var badge = 1;
                                            var alertMessage = req.user.firstName + " " + req.user.lastName + " : " +msg.content;
                                            var payload = {'messageFrom': 'Caroline'};
                                            push(token,alertMessage,payload,badge);
                                        }
                                    };
                                }
                                
                            };
                        });


                    // send email to all recipients
                    User.find()
                        .select('email')
                        .where('_id').in(msg._recipient)
                        .where('logicDelete').equals(false)
                        .exec(function(err, recipients) {
                            // send new-message mail
                            Mailer.newMessage(recipients, {
                                _id: msg._id,
                                authorName: req.user.firstName + ' ' + req.user.lastName,
                                authorPhoto: req.user.photo,
                                subject: msg.subject,
                                content: msg.content
                            });
                        });

                    res.json(msg);
                }
            });

        }
    });
};

function isUserOnline(user){
    var c = sio.sockets.clients(user);
    return c.length > 0;
}