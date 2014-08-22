define([
    'text!common/template/search/empty.html',
], function(
    template
) {
    return Backbone.Marionette.ItemView.extend({
        template: template
    });
});