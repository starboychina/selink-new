define([
    'common/view/item-base',
    'text!common/template/group/detail/description.html'
], function(
    BaseView,
    template) {

    return BaseView.extend({

        // template
        template: template,

        // place holder
        placeholder: '<div class="empty-view text-muted bigger-125 center">グループ紹介はまだ登録していません<br/>ここをクリックして編集できます</div>',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            this.events = _.extend({}, this.events, {
                'focusout .sl-editor': 'save'
            });
        },

        // // after render
        // onRender: function() {
        //     this.$el.find('.wysiwyg-editor')
        //         .ace_wysiwyg().prev().addClass('wysiwyg-style3');
        // },

        // get user input data
        getData: function() {

            var inputText = this.$el.find('textarea').val(),
                cleanText = inputText.replace(/(?:\r\n|\r|\n)/g, '<br />');
                
            // if the clean text is blank
            if (_.str.isBlank(cleanText))
                // set description to blank
                return {
                    description: ""
                };
            else
                // or set the input text
                return {
                    description: cleanText
                };
        },

        // render value by user input data
        renderValue: function(data) {
            // if user input is nothing
            if (!data.description) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value
            this.ui.value.empty().html(data.description);
        }

    });
});