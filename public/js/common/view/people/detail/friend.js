define([
    'text!common/template/people/detail/friend.html',
    'text!common/template/people/popover.html'
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
                placement: 'auto',
                title: '<img src="' + this.model.get('cover') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        },

        onClick: function(e) {

            e.preventDefault();

            this.$el.find('img').popover('destroy');
            window.location = '#profile/' + this.model.get('_id');
        }

    });
});