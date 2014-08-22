define([
    'text!common/template/activity/item-day.html',
    'common/view/activity/item'
], function(
    template,
    ItemView) {

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        className: 'timeline-container',

        // child view container
        childViewContainer: '.timeline-items',

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            this.collection = new Backbone.Collection(this.model.get('activities'));
        },

        onShow: function() {
            this.$el.slFadeInUp();
        }
    });

});