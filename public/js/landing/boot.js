require.config({

    baseUrl: '/js',

    paths: {
        // core library
        'jquery': 'lib/jquery',
        'jquery-ui': 'lib/jquery-ui.custom',
        'bootstrap': 'lib/bootstrap',
        'underscore': 'lib/underscore',
        'underscore.string': 'lib/underscore.string',
        'backbone': 'lib/backbone',
        'marionette': 'lib/backbone.marionette',
        'backbone.wreqr': 'lib/backbone.wreqr',
        'backbone.babysitter': 'lib/backbone.babysitter',
        'text': 'lib/text',
        // core theme
        'ace': 'lib/ace',
        'ace-extra': 'lib/ace-extra',
        'ace-element': 'lib/ace-elements',
        // validator
        'validate': 'lib/jquery.validate',
        'gritter': 'lib/jquery.gritter',
        'scrollIt': 'lib/scrollIt',
        'selink': 'lib/selink',
        'app': 'landing/landing'
    },

    shim: {
        'jquery-ui': {
            deps: ['jquery']
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'underscore': {
            exports: '_'
        },
        'underscore.string': {
            deps: ['underscore']
        },
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'ace-extra': {
            deps: ['jquery']
        },
        'ace': {
            deps: ['ace-extra']
        },
        'ace-element': {
            deps: ['ace']
        },
        'validate': {
            deps: ['jquery']
        },
        'gritter': {
            deps: ['ace']
        },
        'scrollIt': {
            deps: ['jquery']
        },
        'selink': {
            deps: ['jquery']
        },
        'app': {
            deps: [
                'jquery-ui',
                'bootstrap',
                'underscore.string',
                'marionette',
                'ace-element',
                'validate',
                'gritter',
                'scrollIt',
                'selink'
            ]
        }
    }
});

require([
    'marionette',
    'app'
], function(
    marionette,
    landing
) {
    landing.start();
});