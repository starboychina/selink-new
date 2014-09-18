var s3 = require('../../utils/aws').s3,
    sns = require('../../utils/aws').sns,
    Post = require('mongoose').model('Post');

module.exports = function(req, res, next) {

    // get the sns message type
    var snsType = req.get('x-amz-sns-message-type');

    // if the type is subscription confirmation
    if (snsType && snsType == 'SubscriptionConfirmation') {

        // confirm the subscription
        sns.confirmSubscription({
            Token: req.body.Token,
            TopicArn: req.body.TopicArn
        }, function(err, data) {
            if (err) next(err);
            else res.json({});
        });

    // if the type is transcoder result notification
    } else {
        console.log(JSON.parse(req.body.Message));

        // parse the message body as json
        var message = JSON.parse(req.body.Message);

        // update the post with the jobId
        Post.findOneAndUpdate({transcoderJobId: message.jobId}, {'setting.publicity': 'all'}, function(err, result) {
            if (err) next(err);
            else {

                // delete the original video file in the input folder on s3
                s3.deleteObject({
                    Key: message.input.key,
                    Bucket: config.s3.bucket,
                }, function(err, data) {
                    if (err) next(err);
                    else res.json({});
                });
            }
        });
    }
}