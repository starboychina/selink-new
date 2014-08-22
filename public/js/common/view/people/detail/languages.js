define([
    'text!common/template/people/detail/languages.html',
    'common/view/people/detail/language'
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