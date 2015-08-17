var _ = require('underscore'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Activity = mongoose.model('Activity'),
    Message = mongoose.model('Message'),
    Group = mongoose.model('Group'),
    Mailer = require('../../mailer/mailer.js'),
    Push = require('../../utils/push');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    _.extend(req.body, {_from: req.user.id, _recipient: req.body.recipient});

    if (req.body.group){
        Group.findById(req.body.group,function(err, group){
            if( group._owner == req.user.id || group.participants.indexOf(req.user.id)){
                createMessage(req, res, next,group);
            }else{
                res.json(403,{})
            }
        });
    }else{
        createMessage(req, res, next);
    }
};
function createMessage(req, res, next, group){
    Message.create(req.body, function(err, message) {

        if (err) next(err);
        else {

            // log user's activity
            createActivity(req.user.id,message._id,next);

            // populate the message with user's info
            message.populate({path:'_from', select: 'type firstName lastName title cover photo createDate'}, function(err, msg) {

                if(err) next(err);
                else {
                    // send real time message
                    var recipient = (group) ? group.announcelist : msg._recipient;
                    if (!recipient){return;}
                    var alertMessage = req.user.nickName + " : " ;
                    var reg_content = /^(\[(音声|画像|動画)\]).*$/i;

                    if (reg_content.test(msg.content)){
                        alertMessage += msg.content.replace(reg_content,"$1");
                    }else{
                        alertMessage += msg.content;
                    }

                    var payload = {
                      type: 'message-new',
                      id: req.user.id
                    };

                    Push(req.user.id, recipient, payload, alertMessage, function(user){
                        if (req.user.id != user.id )
                            sio.sockets.in(user.id).emit('message-new', msg);
                    });
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
