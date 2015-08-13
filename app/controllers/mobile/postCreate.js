// Create post
// ---------------------------------------------
// Create new post, and return the newly created post
// ---------------------------------------------
// 1. create post with content and group
//   2. save the post pointer in author profile
//   3. save the post pointer in group profile
//   4. create author activity
//   5. create notification for author's friends
//     6. send real-time notification to author's friends
//   7. send email notification to author's friends
//   8. create notification for group's participants
//     9. sent real-time notification to group's participants
//   10. send email notification to group's participants
//   11. commit post to solr
//   12. return the new post to client

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Activity = mongoose.model('Activity'),
    Notification = mongoose.model('Notification'),
    s3 = require('../../utils/aws').s3,
    transcoder = require('../../utils/aws').transcoder,
    Push = require('../../utils/push');

var populateField = {
    '_owner': 'type firstName lastName title cover photo',
    'comments._owner': 'type firstName lastName title cover photo',
    'group': 'name cover description'
};

module.exports = function(req, res, next) {
	//req.body = req.query;//test
    async.waterfall([

        // upload images to s3
        function processImages(callback) {

            if (req.body.images && req.body.images.length){

                // upload all images
                async.map(req.body.images, function(image, callback){
            		var params = {
            			Key: 'users/' + req.user.id + '/post/' + image.name,
            			Bucket: config.s3.bucket
				    };
				    // if (image.size == undefined || image.size.width == undefined  || image.size.height == undefined ){
				    // 	res.json(404, {"error":"the size is not set"});
				    // }
					s3.headObject(params, function (err, metadata) {
					  //if (err && err.statusCode === 404) {
            			if (err){
            				res.json(404, err.code);
					  		//callback({"error":404});
            			}
            			else {
            				image.type = metadata.ContentType;
            				callback(null, null);
            			}
					});
                }, callback);
            }
            else callback(null, null);
        },

        // upload video to s3 and transcode it
        function processVideo(imageRes, callback) {

            if (req.body.video) {

                var videoName = req.body.video.name;
				transcoder.createJob({
                    Input: {
                        Key: 'users/' + req.user.id + '/input/' + videoName,
                    },
                    PipelineId: config.sns.pipelineId,
                    Outputs: [
                        {
                            Key: 'users/' + req.user.id + '/post/' + videoName + '.mp4',
                            PresetId: config.sns.mp4PresetId
                        },
                        {
                            Key: 'users/' + req.user.id + '/post/' + videoName + '.webm',
                            PresetId: config.sns.webmPresetId
                        }
                    ]
                }, callback);

            } else callback(null, null);
        },

        // create post
        function createPost(transcoderRes, callback) {

            console.log(transcoderRes);

            var post = {
                _owner: req.user.id,
                content: req.body.content,
                contentText: req.body.content.replace(/<[^>]*>/g, '')
            };
            if (req.body.group)
                post.group = req.body.group;

            if (req.body.images){
                post.images = _.pluck(req.body.images, 'name');
                var imagesformobile = Array();
                for (var i  in req.body.images){
                    imagesformobile[i] = {
                        name:req.body.images[i].name,
                        type:req.body.images[i].type,
                        width:req.body.images[i].size.width,
                        height:req.body.images[i].size.height
                    };
                }
                post.imagesformobile = imagesformobile
            }
            if (req.body.coordinate){
                post.coordinate = req.body.coordinate;
                ////other location info (station name ......)
            }

            if (req.body.video) {
                post.video = req.body.video.name;
                post.setting = {};
                post.setting.publicity = 'none';
            }

            if (transcoderRes && transcoderRes.Job)
                post.transcoderJobId = transcoderRes.Job.Id;

            Post.create(post, callback);
        },

        // create relate information
        function createRelateInfo(post, callback) {

            async.parallel({

                // save the post id in user profile
                updateUser: function(callback) {
                    req.user.posts.addToSet(post.id);
                    req.user.save(callback);
                },

                // save the post id in group profile
                updateGroup: function(callback) {
                    var condition = {};
                    if (req.body.station){//自己参加的车站 其他车站没有权限发帖(自己参加的车站 一定有相应的组 否则 组可能不存在)
                        condition.station = req.body.station;
                        condition.type = "station";

                        Group.findOne(condition,function(err,group){
                            if(group){
                                post.group = group.id;
                                post.save();
                            }
                        })
                    }
                    if (req.body.group){
                        condition._id = req.body.group;
                    }
                    if (req.body.station||req.body.group){
                        // save the post id in group profile
                        Group.findOneAndUpdate(condition, {$addToSet: {posts: post.id}}, callback);
                    }else
                        callback(null);
                },

                // create activity
                createActivity: function(callback) {

                    Activity.create({
                        _owner: req.user.id,
                        type: 'post-new',
                        targetPost: post.id,
                        targetGroup: req.body.group
                    }, callback);
                },

                // send notificaton to all friends
                createNotification: function(callback) {

                    if (req.user.friends && req.user.friends.length)
                        Notification.create({
                            _owner: req.user.friends,
                            _from: req.user.id,
                            type: 'post-new',
                            targetPost: post.id,
                            targetGroup: req.body.group
                        }, callback);
                    else
                        callback(null);
                },

                // index this post in solr
                createSolr: function(callback) {

                    solr.add(post.toSolr(), function(err, result) {
                        if (err) callback(err);
                        else solr.commit(callback);
                    });
                }

            }, function(err, results) {

                if (err) callback(err);
                else callback(null, post, results.updateGroup, results.createNotification);
            });
        },

        function sendMessages(post, group, notification, callback) {

            var postObj = post.toObject(), // this object is the full representation of post, only used for return
                notifiedUser = req.user.friends,
                owner = {
                    _id: req.user.id,
                    type: req.user.type,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    title: req.user.title,
                    cover: req.user.cover,
                    photo: req.user.photo
                };

            // manually populate post owner
            postObj._owner = owner;

            // if the post belong to some group
            if (group) {
                // manually populate post group (as needed)
                postObj.group = {
                    _id: group.id,
                    name: group.name,
                    cover: group.cover,
                    description: group.description
                };

                // --------- this is NOT working :---------------
                // notifiedUser = _.union(req.user.friends, _.without(group.participants, req.user.id));
                // ----------------- Because :-------------------
                // intersection uses simple reference equality to compare the elements, rather than comparing their contents.
                // To compare two ObjectIds for equality you need to use the ObjectId.equals method.
                // So the simplest solution would be to convert the arrays to strings so that intersection will work.
                // ----------------------------------------------

                // change the notification receiver to group members + friends
                group.announcelist.forEach(function(participant) {
                    // note that I use user's '_id', cause the participant is an ObjectId (object).
                    // remember that the 'id' is the string representation of '_id'
                    if (!_.isEqual(participant, req.user._id))
                        notifiedUser.addToSet(participant);
                });
            }
            // send email to all friends
            var alertMessage = req.user.firstName + ' ' + req.user.lastName + '：' + postObj.contentText;
            Push(req.user.id,notifiedUser,alertMessage,function(user){
                // send real time message to friends
                sio.sockets.in(user.id).emit('post-new', {
                    _id: notification.id,
                    _from: owner,
                    type: 'post-new',
                    targetPost: post,
                    targetGroup: group,
                    createDate: new Date()
                });
            });
            // the last result is the created post
            callback(null, postObj);
        }

    ], function(err, post) {
        if (err) next(err);
        // return the created post
        else res.json(post);
    });

};
