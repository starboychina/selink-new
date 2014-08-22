define([
    'text!common/template/topnav/message/empty.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        tagName: 'li',

        template: template
    });
});