define([
    'text!common/template/job/empty-match.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({
        template: template
    });
});