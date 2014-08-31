var _ = require('underscore'),
    fs = require('fs'),
    gm = require('gm'),
    util = require('util'),
    path = require('path'),
    AWS = require('aws-sdk'),
    mongoose = require('mongoose'),
    formidable = require('formidable'),
    User = mongoose.model('User'),
    Post = mongoose.model('Post'),
    Group = mongoose.model('Group'),
    Job = mongoose.model('Job'),
    Announcement = mongoose.model('Announcement'),
    Activity = mongoose.model('Activity');

// parse a file upload
var formidableForm = new formidable.IncomingForm({
    uploadDir: __dirname + '../../../public/upload',
    keepExtensions: true
});

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports = function(req, res, next) {

    if (req.body.engineers) {

        req.body.engineers.forEach(function(engineerData) {

            User.create(engineerData);
        });
    }

    res.send('got it');
};