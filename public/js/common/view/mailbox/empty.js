define([
    'text!common/template/mailbox/empty.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        className: 'message-item isotope-item col-xs-12',

        template: template
    });
});