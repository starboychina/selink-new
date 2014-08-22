define([
    'common/view/item-base',
    'text!common/template/profile/bio.html'
], function(
    BaseView,
    template) {

    return BaseView.extend({

        // template
        template: template,

        // for dnd add class here
        className: 'widget-box transparent',

        // place holder
        placeholder: '<div class="empty-view text-muted bigger-125 center">自己紹介はまだ登録していません<br/>ここをクリックして編集できます</div>',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            this.events = _.extend({}, this.events, {
                'focusout .sl-editor': 'save'
            });
        },

        // after render
        onRender: function() {
            this.$el.find('.wysiwyg-editor')
                .ace_wysiwyg().prev().addClass('wysiwyg-style3');
        },

        // get user input data
        getData: function() {

            var inputText = this.$el.find('.wysiwyg-editor').cleanHtml(),
                cleanText = _.str.stripTags(inputText);

            // if the clean text is blank
            if (_.str.isBlank(cleanText))
                // set bio to blank
                return {
                    bio: ""
                };
            else
                // or set the input text
                return {
                    bio: inputText
                };
        },

        // render value by user input data
        renderValue: function(data) {
            // if user input is nothing
            if (!data.bio) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value
            this.ui.value.empty().html(data.bio);
        }

    });
});