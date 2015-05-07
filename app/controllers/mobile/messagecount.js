// Message count
// ---------------------------------------------
// Return the number messages of current user, in request specified criteria.
// Messages are private, all requests are relate to current user and can't be changed
// ---------------------------------------------
// Parameter:
//   1. type  : The type of messages, "sent", "unread", "received" default: received
// ---------------------------------------------
var _s = require('underscore.string'),
    Message = require('mongoose').model('Message');

module.exports = function(req, res, next) {
    var query = Message.find()
    	.where('_recipient').equals(req.user.id)
    	.where('opened').ne(req.user.id)
    	.where('logicDelete').ne(req.user.id)
    	.sort('createDate')

    //.group(req.user.id)
        .exec(function(err, msgs) {
            if (err) next(err);
            else{
            	var countdata = {}
            	for (var i = msgs.length - 1; i >= 0; i--) {
            		var msg = msgs[i];
            		if(countdata[msg._from]){
            			countdata[msg._from].count ++;
            		}else{
            			countdata[msg._from] = {
            				"count":1,
            				"message":msg.content,
            				"createDate":msg.createDate,
            			};
            		}
            		console.log(msg);
            	};
            	res.json(countdata);
            } 
        });
};