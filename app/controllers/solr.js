var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Group = mongoose.model('Group'),
    Job = mongoose.model('Job'),
    Post = mongoose.model('Post'),
    Message = mongoose.model('Message'),
    Announcement = mongoose.model('Announcement'),
    Tag = mongoose.model('Tag');

exports.user = function(req, res, next) {

    User.find({}, function(err, users) {

        if (err) next(err);
        else {

            users.forEach(function(user) {
                solr.add(user.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'User index successed.'
            });
        }
    });
};

exports.group = function(req, res, next) {

    Group.find({}, function(err, groups) {

        if (err) next(err);
        else {

            groups.forEach(function(group) {
                solr.add(group.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Group index successed.'
            });
        }
    });
};

exports.job = function(req, res, next) {

    Job.find({}, function(err, jobs) {

        if (err) next(err);
        else {

            jobs.forEach(function(job) {
                solr.add(job.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Job index successed.'
            });
        }
    });
};

exports.post = function(req, res, next) {

    Post.find({}, function(err, posts) {

        if (err) next(err);
        else {

            posts.forEach(function(post) {
                solr.add(post.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Post index successed.'
            });
        }
    });
};

exports.message = function(req, res, next) {

    Message.find({}, function(err, messages) {

        if (err) next(err);
        else {

            messages.forEach(function(message) {
                solr.add(message.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Message index successed.'
            });
        }
    });
};

exports.announcement = function(req, res, next) {

    Announcement.find({}, function(err, announcements) {

        if (err) next(err);
        else {

            announcements.forEach(function(announcement) {
                solr.add(announcement.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Announcement index successed.'
            });
        }
    });
};

exports.tag = function(req, res, next) {

    Tag.find({}, function(err, tags) {

        if (err) next(err);
        else {

            tags.forEach(function(tag) {
                solr.add(tag.toSolr(), function(err, solrResult) {
                    if (err) next(err);
                    else console.log(solrResult);
                });
            });

            solr.commit(function(err, res) {
                if(err) console.log(err);
                if(res) console.log(res);
            });

            res.json({
                title: 'Success',
                text: 'Tag index successed.'
            });
        }
    });
};
