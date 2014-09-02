define([
    'text!common/template/post/create/media.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog',

        // ui
        ui: {
            progress: '.progress-bar'
        },

        // events
        events: {

        },

        // Initializer
        initialize: function() {

            var self = this;

            // if new post delivered
            selink.socket.on('progress', function(data) {
                self.$el.find('.progress-bar').css('width',  data.progress + '%').attr('aria-valuenow', data.progress);
            });
        },

        finish: function(media) {

            if (_.str.startsWith(media.type, 'image'))
                $('<img>').attr('src', media.src).appendTo(this.$el.find('.well')).slBounceIn();
            else if (_.str.startsWith(media.type, 'video')) {
                $('<video id="testvideo" controls preload="auto">').addClass('video-js vjs-default-skin').appendTo(this.$el.find('.well')).slBounceIn();

                $('<source>').attr({
                    src: media.src,
                    type: 'video/mp4'
                }).appendTo(this.$el.find('video'));

                videojs("#testvideo", {}, function(){
                  // Player (this) is initialized and ready.
                });

                this.$el.find('video').css('width', '100%');
            }

            this.$el.find('.progress').fadeOut();
        }

    });
});