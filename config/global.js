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
        mongodb: {
            host: 'mongodb://localhost/selink_test',
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink_test',
        },
        redis: {

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
        mongodb: {
            host: 'mongodb://localhost/selink_dev'
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink_dev',
        },
        redis: {

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
        mongodb: {
            host: 'mongodb://localhost/selink'
        },
        solr: {
            host: 'localhost',
            port: '8080',
            core : 'selink',
        },
        redis: {

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