define([
    'text!common/template/group/detail/member.html',
    'text!common/template/people/popover.html'
],function(
    template,
    popoverTemplate
) {

    return Backbone.Marionette.ItemView.extend({

        template: template,

        className: 'thumbnail-item col-xs-2',

        onShow: function() {

            this.$el.find('a').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto top',
                title: '<img src="' + this.model.get('cover') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        }

    });
});