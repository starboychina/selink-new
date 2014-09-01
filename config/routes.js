var fs = require('fs');
var User = require('mongoose').model('User');
var controller = {};
var pattern = /(.*)?\.js/;
var controller_path = __dirname + '/../app/controllers';

fs.readdirSync(controller_path).forEach(function (dir) {

    var stats = fs.statSync(controller_path + '/' + dir);

    if (stats.isDirectory()) {

        controller[dir] = {};

        fs.readdirSync(controller_path + '/' + dir).forEach(function(file) {

            if (~file.indexOf('.js') && file) {
                var match = pattern.exec(file);
                controller[dir][match[1]] = require(controller_path + '/' + dir + '/' + file);
            }
        });
    }
});

console.log(controller);

module.exports = function(app) {

    // Landing
    app.get('/', function(req, res, next){
        res.render('landing');
    });

    // User sign-up
    app.post('/signup', controller.tempaccount.create);
    // Account activate
    app.get('/activate/:id', controller.tempaccount.activate);

    // Retrieve password request
    app.post('/retrieve', controller.resetpassword.create);
    // Retrieve password page
    app.get('/retrieve/:id', controller.resetpassword.show);
    // Reset password
    app.put('/retrieve/:id', controller.resetpassword.update);

    // User Login
    app.post('/login', controller.user.login);
    // User Logout
    app.get('/logout', controller.user.logout);

    // SPA bootstrap
    app.get('/spa', checkLoginStatus, function(req, res, next){
        res.render('./' + req.user.type + '/index', req.user);
    });

    // Search
    app.get('/search', checkLoginStatus, controller.user.search);

    // Get news
    app.get('/newsfeed', checkLoginStatus, controller.post.newsfeed);

    // Bookmarked item
    app.get('/bookmark', checkLoginStatus, controller.user.bookmark);

    // Notifications
    // -------------------------------------------------------------------

    // Get current user's notification
    app.get('/notifications', checkLoginStatus, controller.notification.index);
    // Get current user's notification number
    app.get('/notifications/count', checkLoginStatus, controller.notification.count);
    // Get current user's unconfirmed notification
    app.get('/notifications/unconfirmed', checkLoginStatus, controller.notification.index);
    // Get current user's unconfirmed notification number
    app.get('/notifications/unconfirmed/count', checkLoginStatus, controller.notification.count);

    // Update notification
    app.patch('/notifications/:notification', checkLoginStatus, controller.notification.update);

    // Posts
    // -------------------------------------------------------------------

    // Get posts
    app.get('/posts', checkLoginStatus, controller.post.index);
    // Get posts (user related)
    app.get('/users/:user/posts', checkLoginStatus, controller.post.index);
    // Get posts (group related)
    app.get('/groups/:group/posts', checkLoginStatus, controller.post.index);

    // Get specific posts
    app.get('/posts/:post', checkLoginStatus, controller.post.show);

    // Create post
    app.post('/posts', checkLoginStatus, controller.post.create);
    
    app.put('/media', checkLoginStatus, controller.post.media);

    // Update post
    app.patch('/posts/:post', checkLoginStatus, controller.post.update);
    // Like a post
    app.patch('/posts/:post/like', checkLoginStatus, controller.post.like);
    // Bookmark a post
    app.patch('/posts/:post/bookmark', checkLoginStatus, controller.post.bookmark);

    // Remove post
    app.delete('/posts/:post', checkLoginStatus, controller.post.remove);

    // Comment a post
    app.post('/posts/:post/comments', checkLoginStatus, controller.comment.create);
    // Update comment
    app.patch('/posts/:post/comments/:comment', checkLoginStatus, controller.comment.update);
    // Like comment
    app.patch('/posts/:post/comments/:comment/like', checkLoginStatus, controller.comment.like);
    // Remove comment
    app.delete('/posts/:post/comments/:comment', checkLoginStatus, controller.comment.remove);

    // Groups
    // --------------------------------------------------------------------

    // Get current user's joined groups
    app.get('/groups/joined', checkLoginStatus, controller.group.index);
    // Get current user's groups
    app.get('/groups/mine', checkLoginStatus, controller.group.index);
    // Get current user's unknow groups
    app.get('/groups/discover', checkLoginStatus, controller.group.index);

    // Get groups (user related)
    app.get('/users/:user/groups', checkLoginStatus, controller.group.index);

    // Get specific group
    app.get('/groups/:group', checkLoginStatus, controller.group.show);

    // Create groups
    app.post('/groups', checkLoginStatus, controller.group.create);

    // Update group
    app.patch('/groups/:group', checkLoginStatus, controller.group.update);

    // Upload group cover
    app.put('/groups/:group/cover', checkLoginStatus, controller.group.uploadCover);
    app.put('/groups/:group/cover-scale', checkLoginStatus, controller.group.scaleCover);

    // Invite members
    app.patch('/groups/:group/invite', checkLoginStatus, controller.group.invite);
    // Expel members
    app.patch('/groups/:group/expel', checkLoginStatus, controller.group.expel);
    // Join group
    app.patch('/groups/:group/join', checkLoginStatus, controller.group.join);
    // Apply group
    app.patch('/groups/:group/apply', checkLoginStatus, controller.group.apply);
    // Quit group
    app.patch('/groups/:group/quit', checkLoginStatus, controller.group.expel);

    // Get group member
    app.get('/groups/:group/connections/participants', checkLoginStatus, controller.group.connections);
    // Get group invited people
    app.get('/groups/:group/connections/invited', checkLoginStatus, controller.group.connections);

    // Get group events
    // app.get('/groups/:group/events', checkLoginStatus, controller.event.index);
    // Create new group event
    app.post('/groups/:group/events', checkLoginStatus, controller.event.create);
    // Update group events
    app.patch('/groups/:group/events/:event', checkLoginStatus, controller.event.update);
    // Remove group event
    app.delete('/groups/:group/events/:event', checkLoginStatus, controller.event.remove);

    // Jobs
    // ----------------------------------------------------------------------

    // Get jobs (employer only)
    app.get('/jobs', checkLoginStatus, controller.job.index);
    // Get new jobs (for home)
    app.get('/jobs/news', checkLoginStatus, controller.job.news);
    // Get specific job
    app.get('/jobs/:job', checkLoginStatus, controller.job.show);
    // Match specific job
    app.get('/jobs/:job/match', checkLoginStatus, controller.job.match);
    // Create jobs
    app.post('/jobs', checkLoginStatus, controller.job.create);
    // Update jobs
    app.patch('/jobs/:job', checkLoginStatus, controller.job.update);
    // bookmark a job
    app.patch('/jobs/:job/bookmark', checkLoginStatus, controller.job.bookmark);
    // Remove jobs
    app.delete('/jobs/:job', checkLoginStatus, controller.job.remove);

    // Connections
    // ----------------------------------------------------------------------

    // Get current user's friends
    app.get('/connections/friends', checkLoginStatus, controller.connection.index);
    // Get current user's invited people
    app.get('/connections/invited', checkLoginStatus, controller.connection.index);
    // Get current user's non-friends
    app.get('/connections/nonfriends', checkLoginStatus, controller.connection.index);
    // Get current user's unknow people
    app.get('/connections/discover', checkLoginStatus, controller.connection.index);

    // Get specific user's friends
    app.get('/users/:user/connections', checkLoginStatus, controller.connection.index);

    // Create new connection
    app.patch('/connections/invite', checkLoginStatus, controller.connection.create);
    // Remove connection
    app.patch('/connections/break', checkLoginStatus, controller.connection.remove);

    // Messages
    // ----------------------------------------------------------------------

    // Get current user's messages
    app.get('/messages', checkLoginStatus, controller.message.index);
    // Get current user's message number
    app.get('/messages/count', checkLoginStatus, controller.message.count);
    // Get current user's sent messages
    app.get('/messages/sent', checkLoginStatus, controller.message.index);
    // Get current user's sent message number
    app.get('/messages/sent/count', checkLoginStatus, controller.message.count);
    // Get current user's unread messages
    app.get('/messages/unread', checkLoginStatus, controller.message.index);
    // Get current user's unread message number
    app.get('/messages/unread/count', checkLoginStatus, controller.message.count);

    // Create new message
    app.post('/messages', checkLoginStatus, controller.message.create);
    // Update messages
    app.patch('/messages/:message', checkLoginStatus, controller.message.update);
    // bookmark a message
    app.patch('/messages/:message/bookmark', checkLoginStatus, controller.message.bookmark);
    // Remove message
    app.delete('/messages/:message', checkLoginStatus, controller.message.remove);

    // Events
    // ----------------------------------------------------------------------

    // Get events
    app.get('/events', checkLoginStatus, controller.event.index);
    // Get events number
    app.get('/events/count', checkLoginStatus, controller.event.count);

    // Get events (user relate)
    app.get('/users/:user/events', checkLoginStatus, controller.event.index);
    // Get events (group relate)
    app.get('/groups/:group/events', checkLoginStatus, controller.event.index);

    // Get events number (user relate)
    app.get('/users/:user/events/count', checkLoginStatus, controller.event.count);
    // Get events number (group relate)
    app.get('/groups/:group/events/count', checkLoginStatus, controller.event.count);

    // Create new event
    app.post('/events', checkLoginStatus, controller.event.create);

    // Update events
    app.patch('/events/:event', checkLoginStatus, controller.event.update);

    // Remove event
    app.delete('/events/:event', checkLoginStatus, controller.event.remove);

    // User Profile
    // ----------------------------------------------------------------------

    // Upload user photo
    app.put('/users/:user/photo', checkLoginStatus, controller.user.uploadPhoto);
    app.put('/users/:user/photo-scale', checkLoginStatus, controller.user.scalePhoto);
    // Upload cover
    app.put('/users/:user/cover', checkLoginStatus, controller.user.uploadCover);
    app.put('/users/:user/cover-scale', checkLoginStatus, controller.user.scaleCover);

    // Get user info
    app.get('/users/:user', checkLoginStatus, controller.user.show);
    // Update user info (first-level property)
    app.patch('/users/:id', checkLoginStatus, controller.user.update);
    // Create nested collection item
    app.post('/users/:id/:sub', checkLoginStatus, controller.user.createSubDocument);
    // Update nested collection item
    app.patch('/users/:id/:sub/:subid', checkLoginStatus, controller.user.updateSubDocument);
    // Remove nested collection item
    app.delete('/users/:id/:sub/:subid', checkLoginStatus, controller.user.removeSubDocument);

    // Get activities
    app.get('/activities', checkLoginStatus, controller.activity.index);

    // Show tags
    app.get('/tags', checkLoginStatus, controller.tag.index);
    // Update tags (update tag)
    app.patch('/tags/:id', checkLoginStatus, controller.tag.update);
    // Update tags (remove tag)
    app.delete('/tags/:id', checkLoginStatus, controller.tag.remove);

    // Show announcements
    app.get('/announcements', checkLoginStatus, controller.announcement.index);
    // Create new announcement
    app.post('/announcements', checkLoginStatus, controller.announcement.create);
    // Update announcement (update announcement)
    app.patch('/announcements/:announcement', checkLoginStatus, controller.announcement.update);
    // Update announcement (remove announcement)
    app.delete('/announcements/:announcement', checkLoginStatus, controller.announcement.remove);

    // query address
    app.get('/address/:zipcode', checkLoginStatus, controller.address.show);
    // suggeset user while type ahead
    app.get('/suggest/user', checkLoginStatus, controller.connection.suggest);
    // suggeset tag while type ahead
    app.get('/suggest/tag', checkLoginStatus, controller.tag.suggest);

    // Get StackExcahge Tag Data
    app.post('/stack', checkLoginStatus, controller.tag.create);
    // import data from SELink1.0
    app.post('/import', checkLoginStatus, controller.user.import);

    // Solr index
    app.get('/solr/user', checkLoginStatus, controller.solr.user);
    app.get('/solr/group', checkLoginStatus, controller.solr.group);
    app.get('/solr/job', checkLoginStatus, controller.solr.job);
    app.get('/solr/post', checkLoginStatus, controller.solr.post);
    app.get('/solr/message', checkLoginStatus, controller.solr.message);
    app.get('/solr/announcement', checkLoginStatus, controller.solr.announcement);
    app.get('/solr/tag', checkLoginStatus, controller.solr.tag);
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