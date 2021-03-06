// Create new sub document
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Tag = mongoose.model('Tag');

module.exports = function(req, res, next) {
    //req.body = req.query; //テスト
    if (req.body.type){
        var tags_type = req.body.type
        var tags = toArray(req.body.tags);

        removeTags(req,function(){
            addTags(req,tags,function(){
                req.user.save();
                req.user.populate({path:'tags'}, function(err, user) {
                    res.json(user);
                });
            });
        });
        //res.json(tags_remove);
    }else{
        res.json(400, {});
    }
};
//タグを削除
function removeTags(req,callback){
    Tag.find({"type":req.body.type},function(err,tags){  
        for (var i = tags.length - 1; i >= 0; i--) {
            req.user.tags.pull(tags[i].id);
        };
        callback();
    });
}
//追加
function addTags(req,tags_add,callback){
    Tag.find({"name":{"$in":tags_add},"type":req.body.type},function(err,tags){  
        for (var i = tags.length - 1; i >= 0; i--) {
            //tags_add.pull(tags[i].name);
            tags[i].count++;
            tags[i].save();
            removeObject(tags_add,tags[i].name);
            req.user.tags.addToSet(tags[i].id);
        };
        if(tags_add.length >0){
            createTags(req,tags_add,callback)
        }else{
            callback();
        }
    });
}
//タグを作成
function createTags(req,tags_add,callback){
    var tags = new Array();
    for (var i = tags_add.length - 1; i >= 0; i--) {
        if(tags_add[i]){
            tags.push({
                name:tags_add[i],
                count:1,
                type:req.body.type,
            });
        }
    };
    Tag.create(tags,function(err){
        for (var i=1; i<arguments.length; ++i) {
            var tag = arguments[i];
            req.user.tags.addToSet(tag.id);
            // do some stuff with candy
        }
        callback() 
    });
}

function toArray(str){
    if(!str||""==str){return [];}
    if (typeof str == 'string' || str instanceof String || !str.length){
        return [str];
    }
    return str;
}
function removeObject(arrayObj,item){
    for (var i = arrayObj.length - 1; i >= 0; i--) {
        if( arrayObj[i] == item ){
            delete arrayObj[i];
            return;
        }
    };
}