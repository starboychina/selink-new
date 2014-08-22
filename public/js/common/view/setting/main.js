define([
    'text!common/template/setting/main.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog',

        // events
        events: {
            'click input': 'onSave'
        },

        onSave: function(event) {

            var $target = $(event.target);

            this.model.save('mailSetting.' + $target.attr('name'), $target.is(':checked'), {
                success: function() {
                    $target.closest('.row').find('i').slFlip();
                },
                patch: true,
                wait: true
            });
        }

    });
});