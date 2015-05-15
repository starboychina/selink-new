// Update group
// ---------------------------------------------
// Update a group, and return the updated group
// ---------------------------------------------
// 1. find group with its Id
// 2. update the group
// 3. update the group in solr
// 4. return the group to client

var async = require('async'),
    Group = require('mongoose').model('Group'),
    modelExpand = require('../../utils/modelExpand');

module.exports = function(req, res, next) {

    async.waterfall([

        // update group info
        function updateGroup(callback) {

            // we will use req.body as update paremeter, so:
            // delete _id, cause you can't update _id, it will be error if it exists
            // delete invited, if you want invite someone, use the invite interface
            delete req.body._id;
            delete req.body.invited;

            Group.findByIdAndUpdate(req.params.group, req.body, callback);
        },

        // update solr
        function updateSolr(group, callback) {

            solr.add(group.toSolr(), function(err, result) {
                if (err) callback(err);
                else solr.commit(function(err, result) {
                    if (err) callback(err);
                    else callback(null, group);
                });
            });
        }

    ], function(err, group) {

        if (err) next(err);
        // return the updated group
        else {
            group = modelExpand.group(group,req.user);
            res.json(group);
        }
    });
};