define([
    'text!common/template/topnav/event/empty.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        tagName: 'li',

        template: template
    });
});