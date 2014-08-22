define([
    'text!landing/template/statements.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog'

    });
});