var fs = require('fs'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {

    test: {
        app: {
            name: 'SELink [TEST]',
            env: 'test'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/test/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/test/selink.crt')
        },
        awssdk: {
            accessKey: 'AKIAJIOX3T2P5QLWVC6A',
            secretKey: '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',
            s3:'s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink-test'
        },
        mongodb: {
            host: 'mongodb://localhost/selink_test',
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink_test',
        },
        redis: {
            host: '',
            port: '6379'
        },
        mail: {
            service: "Gmail",
            auth: {
                user: "joe.19840729.china@gmail.com",
                pass: "19840729"
            }
        },
        root: rootPath
    },

    development: {
        app: {
            name: 'SELink [DEV]',
            env: 'development'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/development/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/development/selink.crt')
        },
        awssdk: {
            accessKey: 'AKIAJIOX3T2P5QLWVC6A',
            secretKey: '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',
            s3:'s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink-dev'
        },
        mongodb: {
            host: 'mongodb://localhost/selink_dev'
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink_dev',
        },
        redis: {
            host: '',
            port: '6379'
        },
        mail: {
            service: "Gmail",
            auth: {
                user: "joe.19840729.china@gmail.com",
                pass: "19840729"
            }
        },
        root: rootPath
    },

    production: {
        app: {
            name: 'SELink',
            env: 'production'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/development/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/development/selink.crt')
        },
        awssdk: {
            accessKey: 'AKIAJIOX3T2P5QLWVC6A',
            secretKey: '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',
            s3:'s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink'
        },
        mongodb: {
            host: 'mongodb://localhost/selink'
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink',
        },
        redis: {
            host: '',
            port: '6379'
        },
        mail: {
            port: 587,
            auth: {
                user: "administrator@selink.jp",
                pass: "ZSkikuD2O5"
            }
        },
        root: rootPath
    }
};