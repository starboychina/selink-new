define([
    'text!common/template/group/detail/member/item.html',
    'text!common/template/people/popover.html'
],function(
    template,
    popoverTemplate
) {

    return Backbone.Marionette.ItemView.extend({

        template: template,

        tagName: 'li',

        className: 'thumbnail-item col-xs-2',

        ui: {
            checkMark: '.check-mark',
            selectTxt: '.text .inner'
        },

        events: {
            'click a': 'onClick'
        },

        onShow: function() {

            this.$el.find('a').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto top',
                title: '<img src="' + this.model.get('cover') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        },

        onClick: function(e) {

            if (e) e.preventDefault();

            this.ui.checkMark.toggleClass('hidden');
            this.ui.selectTxt.toggleClass('hidden');

            this.trigger('clicked');
        }
    });
});