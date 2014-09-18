define([
    'text!common/template/profile/photo-crop.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog crop-modal',

        // events
        events: {
            'click .btn-save': 'onSave'
        },

        onShow: function() {

            var self = this;

            this.$el.find('img').Jcrop({
                aspectRatio: 1,
                minSize: [120, 120],
                setSelect: [ 100, 100, 50, 50 ],
                boxWidth: 800,
                onSelect: function(c) {
                    self.select = c;
                }
            });
        },

        onSave: function() {

            var self = this;

            $.ajax({

                // page url
                url: '/users/' + this.model.get('_id') + '/photo-crop',

                // post data
                data: this.select,

                // method is post
                type: 'PUT',

                // use json format
                dataType: 'json',

                // timeout in 3 seconds
                timeout: 3000,

                // success handler
                success: function(result) {

                    self.model.set(result);

                    selink.modalArea.$el.modal('hide');
                }

            });
        }

    });
});