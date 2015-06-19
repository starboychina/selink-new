var Tag = require('mongoose').model('Tag');

module.exports = function(req, res, next) {

    // page number
    var page = req.query.page || 0;
    var condition = {};

    for (var index in req.query) {
        //console.log(index);
        if ( "name" == index){
            condition[index] = new RegExp('^'+req.query[index]+'$', "i");
        }else{
            condition[index] = req.query[index];
        }
    };

    Tag.find(condition)
        .where('logicDelete').equals(false)
        .sort({count:-1})
        .skip(30*page)  // skip n page
        .limit(30)  // 100 user per page
        .exec(function(err, tags) {
            if(err) next(err);
            else res.json(tags);
        });
};