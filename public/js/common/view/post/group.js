define([
    'text!common/template/post/group.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // tag name
        tagName: 'li',

        // template
        template: template,

        // events
        events: {
            'click': 'onClick',
        },

        // on group item clicked
        onClick: function(e) {

            // stop default behavior
            e.preventDefault();
            // tirgger selected event, and pass the model
            this.trigger('selected', this.model);
        }
    });
});