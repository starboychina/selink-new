var apns = require('apn'),
    path = require('path'),
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
module.exports = function(token,alertMessage,payload,badge){
	var apnsConnection = new apns.Connection(options);
	var device = new apns.Device(token);
	var note = new apns.Notification();
	note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
	note.badge = badge;
	note.sound = "ping.aiff";
	note.alert = alertMessage;
	note.payload = payload;
	note.device = device;
	apnsConnection.sendNotification(note);
}