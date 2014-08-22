define([
    'text!common/template/job/item/skill.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // class name
        className: 'progress',

        // initializer
        initialize: function() {

        },

        onShow: function() {

        }

    });
});