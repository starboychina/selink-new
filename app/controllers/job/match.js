var _ = require('underscore'),
    util = require('util'),
    Job = require('mongoose').model('Job');

module.exports = function(req, res, next) {

    // find job
    Job.findById(req.params.job, function(err, job) {

        if (err) next(err);
        else if (job.languages.length === 0 && job.skills.length === 0) res.json([]);
        else {

            var languages = _.map(job.languages, function(language) {
                return language.language;
            });

            var skills = _.map(job.skills, function(skill) {
                return skill.skill;
            });

            var solrQuery = solr.createQuery()
                                .defType('payloadqueryparser')
                                .q(_.union(languages, skills).join(" +"))
                                .fl('id,score')
                                .fq('type:User AND -id:' + job._owner)
                                .qf({language: 1, skill: 1})
                                .plf('language,skill');

            console.log(solrQuery.build());

            solr.search(solrQuery, function(err, obj) {
                if (err) console.log(err);
                else {

                    console.log("#################");
                    console.log(util.inspect(obj));
                    console.log(util.inspect(obj.response.docs));
                    console.log("#################");

                    if (obj.response.numFound > 0)
                        User.find()
                            .select('type firstName lastName title cover photo createDate')
                            .where('_id').in(_.pluck(obj.response.docs, 'id'))
                            .exec(function(err, users) {
                                if (err) next(err);
                                else {

                                    // NOTE: this sucks, the 'in' query in mongodb messed up the socre order
                                    var result = [];

                                    users.forEach(function(user) {
                                        var userObj = user.toObject();
                                        // paste socre in result list, let client sort the result
                                        // TODO: return the numFound
                                        // use user.id in findWhere because it's string, userObj._id don't work
                                        userObj.score = _.findWhere(obj.response.docs, {id: user.id}).score;
                                        result.push(userObj);
                                    });

                                    res.json(result);
                                }
                            });
                    else res.json([]);
                }
            });
        }
    });
};