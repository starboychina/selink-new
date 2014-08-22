var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    tag = require('../app/controllers/tag'),
    job = require('../app/controllers/job'),
    user = require('../app/controllers/user'),
    post = require('../app/controllers/post'),
    group = require('../app/controllers/group'),
    comment = require('../app/controllers/comment'),
    address = require('../app/controllers/address'),
    message = require('../app/controllers/message'),
    resetPs = require('../app/controllers/resetpassword'),
    activity = require('../app/controllers/activity'),
    userEvent = require('../app/controllers/event'),
    connection = require('../app/controllers/connection'),
    tempaccount = require('../app/controllers/tempaccount'),
    notification = require('../app/controllers/notification'),
    announcement = require('../app/controllers/announcement'),
    solrController = require('../app/controllers/solr');

module.exports = function(app) {

    // Landing
    app.get('/', function(req, res, next){
        res.render('landing');
    });

    // User sign-up
    app.post('/signup', tempaccount.create);
    // Account activate
    app.get('/activate/:id', tempaccount.activate);

    // Retrieve password request
    app.post('/retrieve', resetPs.create);
    // Retrieve password page
    app.get('/retrieve/:id', resetPs.show);
    // Reset password
    app.put('/retrieve/:id', resetPs.update);

    // User Login
    app.post('/login', user.login);
    // User Logout
    app.get('/logout', user.logout);

    // SPA bootstrap
    app.get('/spa', checkLoginStatus, function(req, res, next){
        res.render('./' + req.user.type + '/index', req.user);
    });

    // Search
    app.get('/search', checkLoginStatus, user.search);

    // Get news
    app.get('/newsfeed', checkLoginStatus, post.newsfeed);

    // Bookmarked item
    app.get('/bookmark', checkLoginStatus, user.bookmark);

    // Notifications
    // -------------------------------------------------------------------

    // Get current user's notification
    app.get('/notifications', checkLoginStatus, notification.index);
    // Get current user's notification number
    app.get('/notifications/count', checkLoginStatus, notification.count);
    // Get current user's unconfirmed notification
    app.get('/notifications/unconfirmed', checkLoginStatus, notification.index);
    // Get current user's unconfirmed notification number
    app.get('/notifications/unconfirmed/count', checkLoginStatus, notification.count);

    // Update notification
    app.patch('/notifications/:notification', checkLoginStatus, notification.update);

    // Posts
    // -------------------------------------------------------------------

    // Get posts
    app.get('/posts', checkLoginStatus, post.index);
    // Get posts (user related)
    app.get('/users/:user/posts', checkLoginStatus, post.index);
    // Get posts (group related)
    app.get('/groups/:group/posts', checkLoginStatus, post.index);

    // Get specific posts
    app.get('/posts/:post', checkLoginStatus, post.show);

    // Create post
    app.post('/posts', checkLoginStatus, post.create);

    // Update post
    app.patch('/posts/:post', checkLoginStatus, post.update);
    // Like a post
    app.patch('/posts/:post/like', checkLoginStatus, post.like);
    // Bookmark a post
    app.patch('/posts/:post/bookmark', checkLoginStatus, post.bookmark);

    // Remove post
    app.delete('/posts/:post', checkLoginStatus, post.remove);

    // Comment a post
    app.post('/posts/:post/comments', checkLoginStatus, comment.create);
    // Update comment
    app.patch('/posts/:post/comments/:comment', checkLoginStatus, comment.update);
    // Like comment
    app.patch('/posts/:post/comments/:comment/like', checkLoginStatus, comment.like);
    // Remove comment
    app.delete('/posts/:post/comments/:comment', checkLoginStatus, comment.remove);

    // Groups
    // --------------------------------------------------------------------

    // Get current user's joined groups
    app.get('/groups/joined', checkLoginStatus, group.index);
    // Get current user's groups
    app.get('/groups/mine', checkLoginStatus, group.index);
    // Get current user's unknow groups
    app.get('/groups/discover', checkLoginStatus, group.index);

    // Get groups (user related)
    app.get('/users/:user/groups', checkLoginStatus, group.index);

    // Get specific group
    app.get('/groups/:group', checkLoginStatus, group.show);

    // Create groups
    app.post('/groups', checkLoginStatus, group.create);

    // Update group
    app.patch('/groups/:group', checkLoginStatus, group.update);

    // Upload group cover
    app.put('/groups/:group/cover', checkLoginStatus, group.uploadCover);
    app.put('/groups/:group/cover-scale', checkLoginStatus, group.scaleCover);

    // Invite members
    app.patch('/groups/:group/invite', checkLoginStatus, group.invite);
    // Expel members
    app.patch('/groups/:group/expel', checkLoginStatus, group.expel);
    // Join group
    app.patch('/groups/:group/join', checkLoginStatus, group.join);
    // Apply group
    app.patch('/groups/:group/apply', checkLoginStatus, group.apply);
    // Quit group
    app.patch('/groups/:group/quit', checkLoginStatus, group.expel);

    // Get group member
    app.get('/groups/:group/connections/participants', checkLoginStatus, group.connections);
    // Get group invited people
    app.get('/groups/:group/connections/invited', checkLoginStatus, group.connections);

    // Get group events
    // app.get('/groups/:group/events', checkLoginStatus, userEvent.index);
    // Create new group event
    app.post('/groups/:group/events', checkLoginStatus, userEvent.create);
    // Update group events
    app.patch('/groups/:group/events/:event', checkLoginStatus, userEvent.update);
    // Remove group event
    app.delete('/groups/:group/events/:event', checkLoginStatus, userEvent.remove);

    // Jobs
    // ----------------------------------------------------------------------

    // Get jobs (employer only)
    app.get('/jobs', checkLoginStatus, job.index);
    // Get new jobs (for home)
    app.get('/jobs/news', checkLoginStatus, job.news);
    // Get specific job
    app.get('/jobs/:job', checkLoginStatus, job.show);
    // Match specific job
    app.get('/jobs/:job/match', checkLoginStatus, job.match);
    // Create jobs
    app.post('/jobs', checkLoginStatus, job.create);
    // Update jobs
    app.patch('/jobs/:job', checkLoginStatus, job.update);
    // bookmark a job
    app.patch('/jobs/:job/bookmark', checkLoginStatus, job.bookmark);
    // Remove jobs
    app.delete('/jobs/:job', checkLoginStatus, job.remove);

    // Connections
    // ----------------------------------------------------------------------

    // Get current user's friends
    app.get('/connections/friends', checkLoginStatus, connection.index);
    // Get current user's invited people
    app.get('/connections/invited', checkLoginStatus, connection.index);
    // Get current user's non-friends
    app.get('/connections/nonfriends', checkLoginStatus, connection.index);
    // Get current user's unknow people
    app.get('/connections/discover', checkLoginStatus, connection.index);

    // Get specific user's friends
    app.get('/users/:user/connections', checkLoginStatus, connection.index);

    // Create new connection
    app.patch('/connections/invite', checkLoginStatus, connection.create);
    // Remove connection
    app.patch('/connections/break', checkLoginStatus, connection.remove);

    // Messages
    // ----------------------------------------------------------------------

    // Get current user's messages
    app.get('/messages', checkLoginStatus, message.index);
    // Get current user's message number
    app.get('/messages/count', checkLoginStatus, message.count);
    // Get current user's sent messages
    app.get('/messages/sent', checkLoginStatus, message.index);
    // Get current user's sent message number
    app.get('/messages/sent/count', checkLoginStatus, message.count);
    // Get current user's unread messages
    app.get('/messages/unread', checkLoginStatus, message.index);
    // Get current user's unread message number
    app.get('/messages/unread/count', checkLoginStatus, message.count);

    // Create new message
    app.post('/messages', checkLoginStatus, message.create);
    // Update messages
    app.patch('/messages/:message', checkLoginStatus, message.update);
    // bookmark a message
    app.patch('/messages/:message/bookmark', checkLoginStatus, message.bookmark);
    // Remove message
    app.delete('/messages/:message', checkLoginStatus, message.remove);

    // Events
    // ----------------------------------------------------------------------

    // Get events
    app.get('/events', checkLoginStatus, userEvent.index);
    // Get events number
    app.get('/events/count', checkLoginStatus, userEvent.count);

    // Get events (user relate)
    app.get('/users/:user/events', checkLoginStatus, userEvent.index);
    // Get events (group relate)
    app.get('/groups/:group/events', checkLoginStatus, userEvent.index);

    // Get events number (user relate)
    app.get('/users/:user/events/count', checkLoginStatus, userEvent.count);
    // Get events number (group relate)
    app.get('/groups/:group/events/count', checkLoginStatus, userEvent.count);

    // Create new event
    app.post('/events', checkLoginStatus, userEvent.create);

    // Update events
    app.patch('/events/:event', checkLoginStatus, userEvent.update);

    // Remove event
    app.delete('/events/:event', checkLoginStatus, userEvent.remove);

    // User Profile
    // ----------------------------------------------------------------------

    // Upload user photo
    app.put('/users/:user/photo', checkLoginStatus, user.uploadPhoto);
    app.put('/users/:user/photo-scale', checkLoginStatus, user.scalePhoto);
    // Upload cover
    app.put('/users/:user/cover', checkLoginStatus, user.uploadCover);
    app.put('/users/:user/cover-scale', checkLoginStatus, user.scaleCover);

    // Get user info
    app.get('/users/:user', checkLoginStatus, user.show);
    // Update user info (first-level property)
    app.patch('/users/:id', checkLoginStatus, user.update);
    // Create nested collection item
    app.post('/users/:id/:sub', checkLoginStatus, user.createSubDocument);
    // Update nested collection item
    app.patch('/users/:id/:sub/:subid', checkLoginStatus, user.updateSubDocument);
    // Remove nested collection item
    app.delete('/users/:id/:sub/:subid', checkLoginStatus, user.removeSubDocument);

    // Get activities
    app.get('/activities', checkLoginStatus, activity.index);

    // Show tags
    app.get('/tags', checkLoginStatus, tag.index);
    // Update tags (update tag)
    app.patch('/tags/:id', checkLoginStatus, tag.update);
    // Update tags (remove tag)
    app.delete('/tags/:id', checkLoginStatus, tag.remove);

    // Show announcements
    app.get('/announcements', checkLoginStatus, announcement.index);
    // Create new announcement
    app.post('/announcements', checkLoginStatus, announcement.create);
    // Update announcement (update announcement)
    app.patch('/announcements/:announcement', checkLoginStatus, announcement.update);
    // Update announcement (remove announcement)
    app.delete('/announcements/:announcement', checkLoginStatus, announcement.remove);

    // query address
    app.get('/address/:zipcode', checkLoginStatus, address.show);
    // suggeset user while type ahead
    app.get('/suggest/user', checkLoginStatus, connection.suggest);
    // suggeset tag while type ahead
    app.get('/suggest/tag', checkLoginStatus, tag.suggest);

    // Get StackExcahge Tag Data
    app.post('/stack', checkLoginStatus, tag.create);
    // import data from SELink1.0
    app.post('/import', checkLoginStatus, user.import);

    // Solr index
    app.get('/solr/user', checkLoginStatus, solrController.user);
    app.get('/solr/group', checkLoginStatus, solrController.group);
    app.get('/solr/job', checkLoginStatus, solrController.job);
    app.get('/solr/post', checkLoginStatus, solrController.post);
    app.get('/solr/message', checkLoginStatus, solrController.message);
    app.get('/solr/announcement', checkLoginStatus, solrController.announcement);
    app.get('/solr/tag', checkLoginStatus, solrController.tag);
};

checkLoginStatus = function(req, res, next) {

    if (!req.session.userId) {
        if (req.xhr) {
            res.status(401).json({
                title: "セッションの有効期限が切りました。",
                msg: "セキュリティのため、しばらく操作しない場合はサーバーからセッションを切断することがあります。お手数ですが、もう一度ログインしてください。"
            });
        } else {
            res.redirect('/');
        }
    } else {
        // find user by his id
        User.findById(req.session.userId, function(err, user){

            if (!err && user) {
                // associate user with request
                req.user = user;
                next();
            } else {
                next(new Error('Could not restore User from Session.'));
            }
        });
    }
};