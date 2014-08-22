define([
    'text!common/template/job/item/languages.html',
    'common/view/job/item/language'
], function(
    template,
    ItemView
) {

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // child view container
        childViewContainer: '.clearfix',

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