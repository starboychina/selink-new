/*
    No. | Activity Type     | Target  | Content
    --------------------------------------------
    1.  | user-activate     | none    | none
    2.  | user-login        | none    | none
    3.  | user-logout       | none    | none
    4.  | friend-invited    | user    | none
    5.  | friend-approved   | user    | none
    6.  | friend-declined   | user    | none
    7.  | friend-break      | user    | none
    8.  | post-new          | post    | post summary
    9.  | post-liked        | post    | post summary
    10. | post-unliked      | post    | post summary
    11. | post-bookmarked   | post    | post summary
    12. | post-unbookmarked | post    | post summary
    13. | post-commented    | post    | comment summary
    14. | comment-replied   | post    | comment summary
    15. | comment-liked     | post    | comment summary
    16. | comment-unliked   | post    | comment summary
    17. | job-new           | job     | job name
    18. | job-bookmarked    | job     | job name
    19. | message-new       | message | message subject
    20. | group-new         | group   | group
    21. | group-invited     | group   | group, invited people
    22. | group-joined      | group   | group
    23. | group-refused     | group   | group
    24. | group-applied     | group   | group
    25. | group-approved    | group   | group
    26. | group-declined    | group   | group
    27. | event-new         | event   | event
    28. | group-event-new   | event   | event
*/

// Activity index
var Activity = require('mongoose').model('Activity');

module.exports = function(req, res, next) {

    // page number
    var page = req.query.page || 0;

    var query = Activity.find();

    if (req.user.type !== 'admin') {
        query.where('_owner').ne(req.user.id).in(req.user.friends)
            .where('type').nin(['user-login',
                                'user-logout',
                                'friend-declined',
                                'friend-break',
                                'post-unliked',
                                'post-unbookmarked',
                                'comment-unliked',
                                'group-refused',
                                'group-decline',
                                'message-new',
                                'event-new']); // surppress the negative or private activity
    }

    // find the activities of all users
    query.sort('-createDate')
        .skip(20*page)  // skip n page
        .limit(20)  // 20 user per page
        .populate('_owner', 'type firstName lastName title cover photo createDate')
        .populate('targetUser', 'type firstName lastName title cover photo createDate')
        .populate('targetPost')
        .populate('targetJob')
        .populate('targetMessage')
        .populate('targetGroup')   // there is no targetComment, cause comment was embedded in post
        .populate('targetEvent')
        .exec(function(err, activities) {
            if (err) next(err);
            else res.json(activities);
        });
};