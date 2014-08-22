define([
    'text!common/template/topnav/notification/empty.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        tagName: 'li',

        template: template
    });
});