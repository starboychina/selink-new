define([
    'text!common/template/people/detail/skills.html',
    'common/view/people/detail/skill'
], function(
    template,
    ItemView
) {

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // className
        className: 'widget-box transparent',

        // child view container
        childViewContainer: '.widget-main',

        // child view
        childView: ItemView

    });
});