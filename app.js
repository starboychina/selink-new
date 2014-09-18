var env = process.env.NODE_ENV || 'development',
    config = require('./config/global')[env],
    fs = require('fs'),
    AWS = require('aws-sdk'),
    mongoose = require('mongoose'),
    solrClient = require('solr-client');

GLOBAL.config = config;

// Connect to MongoDB
mongoose.connect(config.mongodb.host);
mongoose.connection.on('open', function() {
    if ('production' !== config.app.env) mongoose.set('debug', true);
    console.log("DataBase " + config.mongodb.host + " connected.");
});

// Load MongoDB models
var models_path = config.root + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file);
});

// Create Solr client
GLOBAL.solr = solrClient.createClient(config.solr);
solr.ping(function(err, obj) {
    if (err) console.log(err);
    else console.log("Solr " + config.solr.host + ':' + config.solr.port + '/' + config.solr.core + " connected");
});

// Config AWS
AWS.config.update(config.awssdk);

// Create Exrepss Server
var app = require('./config/express')(config);

module.exports = app;