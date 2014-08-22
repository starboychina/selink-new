define([
    'text!common/template/job/item/skills.html',
    'common/view/job/item/skill'
], function(
    template,
    ItemView
) {

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // child view container
        childViewContainer: '.profile-skills',

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

        },

        onRender: function() {

        },

        onShow: function() {

        }

    });
});