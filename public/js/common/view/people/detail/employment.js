define([
    'text!common/template/people/detail/employment.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

    });
});