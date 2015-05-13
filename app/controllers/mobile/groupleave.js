var async = require('async'),
    mongoose = require('mongoose'),
    Group = mongoose.model('Group'),
    User = mongoose.model('User');

module.exports = function(req, res, next) {

    async.waterfall([

        // find the group
        function findGroup(callback) {
            Group.findById(req.params.group, callback);
        },

        // create relate information
        function createRelateInfo(group, callback) {

            async.parallel({

                // update the 'participants' field
                updateGroup: function(callback) {

                	group.participants.pull(req.user.id);
                    group.announcelist.pull(req.user.id);
                    group.stickylist.pull(req.user.id);

                	if(req.user.id == group._owner){
                		if (group.participants.length > 0){
                			group._owner = group.participants[0];
                		}else{
                			//group._owner
                			group.logicDelete = true;
                		}
                	}

                    group.save(callback);
                },

                // remove the group from expeled member's group list
                updateUser: function(callback) {
                	req.user.groups.pull(group.id);
                	req.user.save(callback);
                },

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, results.updateGroup[0], results.createNotification);
            });

        }

    ], function(err, group) {

        if (err) next(err);
        // return the updated group
        else res.json(group);
    });

};