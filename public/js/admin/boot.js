require.config({

    baseUrl: "/js",

    paths: {
        // core library
        'jquery': "lib/jquery",
        'jquery-ui': "lib/jquery-ui.custom",
        'bootstrap': "lib/bootstrap",
        'underscore': 'lib/underscore',
        'underscore.string': 'lib/underscore.string',
        'backbone': 'lib/backbone',
        'marionette': 'lib/backbone.marionette',
        'backbone.wreqr': 'lib/backbone.wreqr',
        'backbone.babysitter': 'lib/backbone.babysitter',
        'backbone.validation': 'lib/backbone.validation',
        'deep-model': 'lib/deep-model',
        'text': 'lib/text',
        // core theme
        'ace': "lib/ace",
        'ace-extra': "lib/ace-extra",
        'ace-element': "lib/ace-elements",
        // pie chart
        'pie-chart': "lib/jquery.easypiechart",
        // calendar
        'full-calendar': "lib/fullcalendar",
        'google-calendar': "lib/gcal",
        // date time
        'datepicker-locale': "lib/date-time/locales/bootstrap-datepicker.ja",
        'datepicker': "lib/date-time/bootstrap-datepicker",
        'timepicker': "lib/date-time/bootstrap-timepicker",
        'moment': "lib/date-time/moment-with-langs",
        // file upload
        'jquery.ui.widget': 'lib/jquery.ui.widget',
        'iframetransport': 'lib/jquery.iframe-transport',
        'fileupload': 'lib/jquery.fileupload',
        'jcrop': 'lib/jquery.Jcrop',
        // input mask
        'maskedinput': "lib/jquery.maskedinput",
        'autosize': "lib/jquery.autosize",
        'chosen': 'lib/chosen.jquery',
        'gritter': 'lib/jquery.gritter',
        'colorbox': 'lib/jquery.colorbox',
        'knob': 'lib/jquery.knob',
        'wysiwyg': 'lib/bootstrap-wysiwyg',
        'hotkeys': 'lib/jquery.hotkeys',
        // isotope
        'bridget': 'lib/jquery.bridget',
        'imagesloaded': 'lib/imagesloaded.pkgd',
        'isotope': 'lib/isotope.pkgd',
        'nicescroll': 'lib/jquery.nicescroll',
        'infinite-scroll': 'lib/jquery.infinitescroll',
        'tag': 'lib/bootstrap-tag',
        'typeahead': 'lib/typeahead.bundle',
        'selink': 'lib/selink',
        // 'socket.io': '../socket.io/socket.io.js',
        'socket.io': 'lib/socket.io',
        'app': 'admin/admin'
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
        'deep-model': {
            deps: ['backbone']
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
        'pie-chart': {
            deps: ['jquery']
        },
        'full-calendar': {
            deps: ['jquery']
        },
        'google-calendar': {
            deps: ['full-calendar']
        },
        'datepicker': {
            deps: ['jquery']
        },
        'datepicker-locale': {
            deps: ['bootstrap', 'datepicker']
        },
        'timepicker': {
            deps: ['jquery']
        },
        'fileupload': {
            deps: ['jquery', 'jquery.ui.widget', 'iframetransport']
        },
        'jcrop': {
            deps: ['jquery']
        },
        'maskedinput': {
            deps: ['jquery']
        },
        'autosize': {
            deps: ['jquery']
        },
        'chosen': {
            deps: ['jquery']
        },
        'gritter': {
            deps: ['ace']
        },
        'colorbox': {
            deps: ['jquery']
        },
        'knob': {
            deps: ['jquery']
        },
        'hotkeys': {
            deps: ['jquery']
        },
        'wysiwyg': {
            deps: ['bootstrap', 'hotkeys']
        },
        'bridget': {
            deps: ['jquery']
        },
        'imagesloaded': {
            deps: ['jquery']
        },
        'isotope': {
            deps: ['jquery', 'bridget', 'imagesloaded']
        },
        'nicescroll': {
            deps: ['jquery']
        },
        'infinite-scroll': {
            deps: ['jquery']
        },
        'tag': {
            deps: ['bootstrap']
        },
        'typeahead': {
            deps: ['bootstrap']
        },
        'selink': {
            deps: ['jquery']
        },
        'app': {
            deps: [
                'jquery-ui',
                'bootstrap',
                'marionette',
                'underscore.string',
                'deep-model',
                'backbone.validation',
                'ace-element',
                'pie-chart',
                'full-calendar',
                'google-calendar',
                'datepicker-locale',
                'timepicker',
                'moment',
                'fileupload',
                'jcrop',
                'maskedinput',
                'autosize',
                'chosen',
                'colorbox',
                'gritter',
                'knob',
                'wysiwyg',
                'bridget',
                'imagesloaded',
                'isotope',
                'nicescroll',
                'infinite-scroll',
                'tag',
                'typeahead',
                'selink',
                'socket.io'
            ]
        }
    }
});

require([
    'deep-model',
    'marionette',
    'moment',
    'backbone.validation',
    'pie-chart',
    'fileupload',
    'autosize',
    'bridget',
    'imagesloaded',
    'isotope',
    'nicescroll',
    'app'
], function(
    deepModel,
    marionette,
    moment,
    validation,
    pieChart,
    fileupload,
    autosize,
    bridget,
    imagesloaded,
    isotope,
    nicescroll,
    admin
) {
    $.bridget( 'isotope', isotope );
    admin.start();
});