define([
    'text!common/template/topnav/event/item.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        tagName: 'li',

        // template
        getTemplate: function(){

            return template;
        }

    });
});