var path = require('path'),
    http = require('http'),
    https = require('https'),
    express = require('express'),
    favicon = require('static-favicon'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    methodOverride = require('method-override'),
    lessMiddleware = require('less-middleware'),
    session = require('express-session'),
    RedisStore = require('connect-redis')(session),
    io = require('socket.io'),
    errorhandler = require('errorhandler');

module.exports = function(config) {

    var app = express();

    // View directory
    app.set('views', path.join(config.root, '/app/views'));

    // View engine is jade
    app.set('view engine', 'jade');

    // Fav-icon
    app.use(favicon());

    // Logger use express-logger in production, otherwise use morgan
    if ('production' !== config.app.env)
        app.use(require('morgan')('dev'));
    else
        app.use(require('express-logger')({
            path: config.root + '/log/requests.log'
        }));

    // Fix Content-Type for aws sns
    app.use(function(req, res, next){
        if (req.headers['x-amz-sns-message-type']) {
            req.headers['content-type'] = 'application/json;charset=UTF-8';
        }
        next();
    });

    // Parse application/json
    app.use(bodyParser.json());

    // Parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded());

    // Override request method
    app.use(methodOverride());

    // Parse cookie before session
    app.use(cookieParser('cookie secret sauce'));

    // Redis session storage
    var redisStore = new RedisStore();

    // Session
    app.use(session({
        store: redisStore,
        secret: 'session secret sauce',
        saveUninitialized: true,
        resave: true
    }));

    /* TODO: CSRF support */

    // Less Middleware
    app.use(lessMiddleware('/less', {
        dest: '/css',
        pathRoot: path.join(config.root, 'public')
    }));

    // Public folder
    app.use(express.static(path.join(config.root, 'public')));

    // Error handler, not linked in production
    if ('production' !== config.app.env) {
        app.use(errorhandler());
    }

    // SELink Routes
    require('./routes')(app, config);

    // assume "not found" in the error msgs
    // is a 404. this is somewhat silly, but
    // valid, you can do whatever you like, set
    // properties, use instanceof etc.
    app.use(function(err, req, res, next){

        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        // log it, send emails if you want
        console.error(err.stack);
    });

    // assume 404 since no middleware responded
    app.use(function(req, res, next){
        // 404 page
        res.status(404).render('404', {});
    });

    // Express 3 requires a http.Server to attach socke.io
    // var server = https.createServer(config.ssl, app);
    var server = http.createServer(app);

    // attach socket.io
    GLOBAL.sio = io.listen(server);
    sio.set('log level', 2);

    // SessionSocket
    var SessionSockets = require('session.socket.io-express4'),
        // caution! 'use cookieParser()', not 'cookieParser'
        sessionSockets = new SessionSockets(sio, redisStore, cookieParser());

    sessionSockets.on('connection', function(err, socket, session) {

        if (session) {

            socket.join(session.userId);

            socket.emit('message', {
                title: "welcome to " + config.app.name,
                msg: "welcome"
            });

        } else socket.emit('no-session');
    });

    return server;
};