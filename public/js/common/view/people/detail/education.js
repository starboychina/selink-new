define([
    'text!common/template/people/detail/education.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,
    });
});