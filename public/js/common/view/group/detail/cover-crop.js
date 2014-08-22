define([
    'text!common/template/group/detail/cover-crop.html',
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
                aspectRatio: 4,
                minSize: [600, 150],
                setSelect: [ 0, 0, 600, 150 ],
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
                url: '/groups/' + this.model.get('_id') + '/cover-scale',

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

                    self.model.set('cover', result.cover);

                    selink.modalArea.$el.modal('hide');
                }

            });
        }

    });
});