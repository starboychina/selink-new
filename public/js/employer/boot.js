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
        'fastclick': 'lib/fastclick',
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
        // wizard
        'wizard': "lib/fuelux/fuelux.wizard",
        // file upload
        'jquery.ui.widget': 'lib/upload/jquery.ui.widget',
        'iframetransport': 'lib/upload/jquery.iframe-transport',
        'fileupload': 'lib/upload/jquery.fileupload',
        'fileupload-process': 'lib/upload/jquery.fileupload-process',
        'load-image': 'lib/upload/load-image',
        'load-image-meta': 'lib/upload/load-image-meta',
        'load-image-exif': 'lib/upload/load-image-exif',
        'load-image-ios': 'lib/upload/load-image-ios',
        'canvas-to-blob': 'lib/upload/canvas-to-blob',
        'imagePreview': 'lib/upload/jquery.fileupload-image',
        'videoPreview': 'lib/upload/jquery.fileupload-video',
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
        'videojs': 'lib/video',
        'selink': 'lib/selink',
        // 'socket.io': '../socket.io/socket.io.js',
        'socket.io': 'lib/socket.io',
        'app': 'employer/employer'
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
        'wizard': {
            deps: ['bootstrap']
        },
        'fileupload': {
            deps: ['jquery', 'jquery.ui.widget', 'iframetransport']
        },
        'fileupload-process': {
            deps: ['fileupload']
        },
        'load-image': {
            deps: ['jquery']
        },
        'load-image-meta': {
            deps: ['load-image']
        },
        'load-image-exif': {
            deps: ['load-image-meta']
        },
        'load-image-ios': {
            deps: ['load-image']
        },
        'canvas-to-blob': {
            deps: ['jquery']
        },
        'imagePreview': {
            deps: ['fileupload-process', 'load-image-exif', 'load-image-ios', 'canvas-to-blob']
        },
        'videoPreview': {
            deps: ['fileupload-process', 'load-image']
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
                'fastclick',
                'ace-element',
                'pie-chart',
                'full-calendar',
                'google-calendar',
                'datepicker-locale',
                'timepicker',
                'moment',
                'wizard',
                'fileupload',
                'imagePreview',
                'videoPreview',
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
                'videojs',
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
    'fastclick',
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
    fastclick,
    pieChart,
    fileupload,
    autosize,
    bridget,
    imagesloaded,
    isotope,
    nicescroll,
    employer
) {
    fastclick.attach(document.body);
    videojs.options.flash.swf = "/swf/video-js.swf"
    $.bridget( 'isotope', isotope );
    employer.start();
});