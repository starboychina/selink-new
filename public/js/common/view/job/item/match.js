define([
    'text!common/template/job/item/match.html',
    'text!common/template/people/popover.html'
],function(
    template,
    popoverTemplate
) {

    return Backbone.Marionette.ItemView.extend({

        template: template,

        className: 'match-item col-xs-2',

        events: {
            'click img': 'toProfile'
        },

        // after render
        onRender: function() {

            // add popover on author photo
            this.$el.find('img').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto top',
                title: '<img src="' + this.model.get('cover_ref') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on user's photo
            this.$el.find('img').popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.id;
        }

    });
});