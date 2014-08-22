define([
    'text!common/template/people/detail/group.html',
    'text!common/template/group/popover.html'
], function(
    template,
    popoverTemplate
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        tagName: 'li',

        // class name
        className: 'timeline-item',

        events: {
            'click a': 'onClick'
        },

        onShow: function() {
            this.$el.find('img').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.get('cover') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        },

        onClick: function(e) {

            e.preventDefault();

            this.$el.find('img').popover('destroy');
            window.location = '#group/' + this.model.get('_id');
        }

    });
});