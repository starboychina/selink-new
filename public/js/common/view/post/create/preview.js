define([
    'text!common/template/post/create/preview.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // tagName
        tagName: 'li',

        // className
        className: 'col-xs-12 col-md-3 no-margin center',

        // ui
        ui: {
            progress: '.progress',
            progressBar: '.progress-bar'
        },

        // events
        events: {
            'click .btn-remove': 'onRemoveClick'
        },

        // model events
        modelEvents: {
            'change:progress': 'onProgress'
        },

        // after render
        onRender: function() {
            // prepend image preview to el
            this.$el.find('.img').prepend(this.model.get('preview'));
        },

        // update progress bar
        onProgress: function() {

            var self = this,
                progress = this.model.get('progress');

            // update progress
            this.ui.progressBar.css('width',progress + '%');

            // if the progress is 100%
            if (progress == 100) 
                // hide progress bar after 0.5s delay
                setTimeout(function() {
                    self.ui.progress.fadeOut();
                }, 300);
        },

        // remove this image
        onRemoveClick: function() {
            this.trigger('removeImage');
        }

    });
});