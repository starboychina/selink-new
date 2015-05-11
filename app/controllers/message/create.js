var _ = require('underscore'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Message = mongoose.model('Message'),
    Group = mongoose.model('Group'),
    Mailer = require('../../mailer/mailer.js'),
    push = require('../../utils/push');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    _.extend(req.body, {_from: req.user.id, _recipient: req.body.recipient});

    if (req.body.group){
        Group.findById(req.body.group,function(err, group){
            if(group.participants.indexOf(req.user.id)){
                createMessage(req, res, next,group);
            }else{
                res.json(401,{})
            }
        });
    }else{
        createMessage(req, res, next);
    }
};
function createMessage(req, res, next,group){
    Message.create(req.body, function(err, message) {

        if (err) next(err);
        else {

            // log user's activity
            createActivity(req.user.id,message._id,next);

            // populate the message with user's info
            message.populate({path:'_from', select: 'type firstName lastName title cover photo createDate'}, function(err, msg) {

                if(err) next(err);
                // send real time message
                else {

                    sendSockets(msg,group);
                    sendPush(msg,group);

/*
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
*/
                    res.json(msg);
                }
            });

        }
    });
}
function createActivity(user,msgid,next){
    // log user's activity
    Activity.create({
        _owner: user,
        type: 'message-new',
        targetMessage: msgid
    }, function(err) {
        if (err) next(err);
    });
}
function sendSockets(msg,group){
    var recipient = (group) ? group.participants : msg._recipient;
    recipient.forEach(function(room) {
        sio.sockets.in(room).emit('message-new', msg);
    });
}
function sendPush(msg,group){
    var recipient = (group) ? group.participants : msg._recipient;
    // push
    User.find()
        //.select('email')
        .where('_id').in(recipient)
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
}
function isUserOnline(user){
    var c = sio.sockets.clients(user);
    return c.length > 0;
}