// Create new sub document
var User = require('mongoose').model('User'),
    https = require('https');

module.exports = function(req, res, next) {
    req.body = req.query; //テスト
    if (req.body.openid && req.body.access_token && req.body.type){
        var opendiLoginAction;
        if (req.body.type == "wx"){
            opendiLoginAction = loginWithWeChat;
        }else if (req.body.type == "qq"){
            opendiLoginAction = loginWithQQ;
        }
        if (opendiLoginAction){
            opendiLoginAction(req.body.openid,req.body.access_token,function(isok){
                if(isok){
                    getuserInfo(req,res);
                }else{
                    res.json(401,{})
                }
            });
            return;
        }
    }
    res.json(401, {});
};
var getuserInfo = function(req,res){
    var param = {
        "openids.openid":req.body.openid,
        "openids.type":req.body.type
    };
    User.findOne(param,{"_id":true},function(err,user){
        if (err) next(err);
        else if(user==null){
            res.json(401,req.body)
        }
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
            // send success signal
            res.json(200,user);
        }
    });
}
var loginWithQQ = function (openid,token,callback){
    var appid = "1103821830";
    var url_check = "https://graph.qq.com/user/get_user_info?access_token="+token+"&oauth_consumer_key="+appid+"&openid="+openid+"&format=json";
    httpRequest(url_check,function(data){
        //console.log("qq: ", data);
        callback(data.ret == 0);
    });
}
var loginWithWeChat = function(openid,token,callback){
    var url_check = "https://api.weixin.qq.com/sns/auth?openid="+openid+"&access_token="+token;
    httpRequest(url_check,function(data){
        //console.log("wx: ", data);
        callback(data.errcode == 0);
    });
}
var httpRequest = function(url,callback){
    https.get(url, function (res) {
      //console.log("statusCode: ", res.statusCode);
      //console.log("headers: ", res.headers);
      var data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        callback(JSON.parse(data));
      });
    });
}