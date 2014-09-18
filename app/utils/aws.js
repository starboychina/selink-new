var AWS = require('aws-sdk');

exports.s3 = new AWS.S3({apiVersion: '2006-03-01'});
exports.sns = new AWS.SNS({apiVersion: '2010-03-31'});
exports.transcoder = new AWS.ElasticTranscoder({apiVersion: '2012-09-25'});