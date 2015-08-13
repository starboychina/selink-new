var apns = require('apn'),
    path = require('path'),
    User = require('mongoose').model('User'),
	rootPath = path.normalize(__dirname + '/../../');
var options = {
    cert: rootPath + 'resource/push/cert.pem',                 /* Certificate file path */
    key:  rootPath + 'resource/push/key.pem',                  /* Key file path */
    gateway: 'gateway.push.apple.com',/* gateway address */
    port: 2195,                       /* gateway port */
    errorCallback: function(err, notification){
    	console.log("err " + err);
    } ,    /* Callback when error occurs function(err,notification) */
};
module.exports = function(sender,users,alertMessage,onlinefunc){
	if (!users){return;}
	if (typeof users == 'string' || users instanceof String || !users.length){
		users = [users];
	}

    User.find()
        .where('_id').in(users)
        .where('_id').ne(sender)
        .where('logicDelete').equals(false)
        .exec(function(err, recipients) {
        	if (!err){
        		send(recipients,alertMessage,onlinefunc);
        	}
        });
}

module.exports.all = function(sender,alertMessage,onlinefunc){
    User.find()
        .where('_id').ne(sender)
        .where('logicDelete').equals(false)
        .exec(function(err, recipients) {
            if (!err){
                send(recipients,alertMessage,onlinefunc);
            }
        });
}

function send(users,alertMessage,onlinefunc){

	for (var i = users.length - 1; i >= 0; i--) {
    	var user = users[i];

        if(sio.sockets.clients(user.id).length < 1 ){

        	var devices = user.devices;
            for (var j = devices.length - 1; j >= 0; j--) {
            	var device = devices[j];
                if(device.token){

                    //push
        					var apnsConnection = new apns.Connection(options);
        					var device = new apns.Device(device.token);
        					var note = new apns.Notification();
        					note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        					note.badge = 1;
        					note.sound = "ping.aiff";
        					note.alert = alertMessage;
        					note.payload = {'messageFrom': 'Caroline'};
        					note.device = device;
        					apnsConnection.sendNotification(note);
                }
            };
        }else if (onlinefunc){
    		//console.log("onlinefunc");
        	onlinefunc(user);
        }

    };
}
