// Connection list
// ---------------------------------------------
// Return a list of 20 people that have specific connection with user in descending order of create date.
// In the case of get some user's connections, user id must passed by the route: '/users/:user/connection'
// ---------------------------------------------
// Parameter:
//   1. user  : The user's id of posts list blong to, passed by url                          default: current user
//   2. type  : The type of connection, identified by the path of request                    default: friends
//              a. friends    -- the people are user's friends
//              b. invited    -- the people that user had invited as friend
//              c. nonfriends -- the people are not user's friends (include invited)
//              d. discover   -- the people that user completely unknow (exclude invited)
//   3. before: A Unix time stamp used as start point of retrive                             default: none
//   4. size  : Number of result to return                                                   default: 20
// ---------------------------------------------

var _s = require('underscore.string'),
    async = require('async'),
    moment = require('moment'),
    Message = require('mongoose').model('Message'),
    User = require('mongoose').model('User');

module.exports = function(req, res, next) {

    // TODO: check parameters

    // if the request was get some specific user's connections
    // we need to get the user from users collection

    // if specified someone not current user
    if (req.params.user && req.params.user !== req.user.id) {

        // get the user's connections (user ids)
        User.findById(req.params.user, 'friends invited', function(err, uesr) {
            // pass the user to internal method
            if (err) next(err);
            else _connection_index(req, res, uesr, next);
        });

    } else {

        // no specified user, pass current user to internal method
        _connection_index(req, res, req.user, next);
    }

};

// internal method for index
_connection_index = function(req, res, user, next) {

    // create query
    var query = User.find();

    // if request "invited" connection type
    if (_s.endsWith(req.path, "/invited"))
        query.where('_id').in(user.invited);

    // if request "nonfriends" connection type
    else if (_s.endsWith(req.path, "/nonfriends"))
        query.where('_id').ne(user._id).nin(user.friends);

    // if request "discover" connection type
    else if (_s.endsWith(req.path, "/discover")){
        //query.where('_id').ne(user._id).nin(user.friends.concat(user.invited));
        query.where('_id').ne(user._id).nin(user.friends);
        if (req.query.withtag == 1){
            query.where('tags').in(user.tags);
        }
    }

    // defaultly, find "friends"
    else
        query.where('_id').in(user.friends);

    // if request items before some time point
    if (req.query.before)
        query.where('createDate').lt(moment.unix(req.query.before).toDate());

    query.select('type nickName firstName lastName title cover bio photo employments educations tags createDate')
        .populate('tags')
        .where('logicDelete').equals(false)
        .limit(req.query.size || 20)
        .sort('-createDate')
        .exec(function(err, users) {
            if (err) next(err);
            else if (users.length === 0) res.json(404, {});
            else {
              users.map(function(user) {
                Message.findOne()
                  .select('content createDate')
                  .where('_from').in([req.user.id, req.params.user])
                  .where('_recipient').in([req.user.id, req.params.user])
                  .where('logicDelete').ne(req.user.id)
                  .sort('-createDate')
                  .exec(function(err, message) {
                      if (err) next(err);
                      else {
                        user = user.toObject();
                        user.lastMessage = message;
                      }
                  });
              })

              console.log(users)

              res.json(users);
            }
        });

};
