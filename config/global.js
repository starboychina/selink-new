var fs = require('fs'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

module.exports = {

    test: {
        root: rootPath,
        app: {
            name: 'SELink [TEST]',
            env: 'test'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/test/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/test/selink.crt')
        },
        awssdk: {
            region: 'ap-northeast-1',
            accessKeyId: 'AKIAI2EFNU2BNRYTSKTQ',
            secretAccessKey: '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'
        },
        s3: {
            host: 'https://s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink-test'
        },
        sns: {
            pipelineId: '',
            mp4PresetId: '',
            webmPresetId: ''
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
            host: 'localhost',
            port: '6379'
        },
        mail: {
            service: "Gmail",
            auth: {
                user: "joe.19840729.china@gmail.com",
                pass: "19840729"
            }
        }
    },

    development: {
        root: rootPath,
        app: {
            name: 'SELink [DEV]',
            env: 'development'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/development/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/development/selink.crt')
        },
        awssdk: {
            region: 'ap-northeast-1',
            accessKeyId: 'AKIAI2EFNU2BNRYTSKTQ',
            secretAccessKey: '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'
        },
        s3: {
            host: 'https://s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink-dev'
        },
        sns: {
            pipelineId: '1409719474215-50dzhm',
            mp4PresetId: '1409841778895-126phl',
            webmPresetId: '1409841987185-nf4lag'
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
            host: 'localhost',
            port: '6379'
        },
        mail: {
            service: "Gmail",
            auth: {
                user: "joe.19840729.china@gmail.com",
                pass: "19840729"
            }
        }
    },

    production: {
        root: rootPath,
        app: {
            name: 'SELink',
            env: 'production'
        },
        ssl: {
            key: fs.readFileSync(rootPath + '/resource/ssl/development/selink.pem'),
            cert: fs.readFileSync(rootPath + '/resource/ssl/development/selink.crt')
        },
        awssdk: {
            region: 'ap-northeast-1',
            accessKeyId: 'AKIAI2EFNU2BNRYTSKTQ',
            secretAccessKey: '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'
        },
        s3: {
            host: 'https://s3-ap-northeast-1.amazonaws.com',
            bucket: 'selink'
        },
        sns: {
            pipelineId: '',
            mp4PresetId: '',
            webmPresetId: ''
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
            host: 'localhost',
            port: '6379'
        },
        mail: {
            port: 587,
            auth: {
                user: "administrator@selink.jp",
                pass: "ZSkikuD2O5"
            }
        }
    }
};