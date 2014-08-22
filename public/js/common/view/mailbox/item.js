define([
    'text!common/template/mailbox/item/received.html',
    'text!common/template/mailbox/item/sent.html',
    'common/view/mailbox/edit',
    'common/model/message',
    'common/model/base'
], function(
    receivedTemplate,
    sentTemplate,
    MessageEditView,
    MessageModel,
    BaseModel
) {

    return Backbone.Marionette.ItemView.extend({

        className: 'message-item isotope-item col-xs-12',

        // template
        getTemplate: function(){

            if (this.model.get("isMine"))
                return sentTemplate;
            else
                return receivedTemplate;
        },

        ui: {
            selection: 'input[type="checkbox"]',
            bookmarkBtn: '.message-star',
            subject: '.text',
            replyBtn: '.btn-reply',
            removeBtn: '.btn-remove'
        },

        events: {
            'click input[type="checkbox"]': 'toggleSelect',
            'click .message-star': 'onBookmark',
            'click .text': 'showMessage',
            'click .btn-reply': 'replyMessage',
            'click .btn-remove': 'removeMessage'
        },

        modelEvents: {
            'change:isUnread': 'markRead',
            'change:bookmarked': 'renderBookmark'
        },

        initialize: function() {

            // if the message not belong to the user
            // or user's id exists in message's opened list
            if (this.model.get('isUnread')) {
                // mark as unread
                this.$el.addClass('message-unread');
            }
        },

        // after render
        onRender: function() {

            var self = this;

            // add tooltip on add button
            this.ui.replyBtn.tooltip({
                placement: 'top',
                title: "返信"
            });

            this.ui.removeBtn.tooltip({
                placement: 'top',
                title: "削除"
            });
        },


        toggleSelect: function() {

            var checked = this.ui.selection.prop('checked');

            if (checked) {
                this.$el.addClass('selected');
                this.trigger('selected');
            } else {
                this.$el.removeClass('selected');
                this.trigger('unselected');
            }
        },

        // select message (for message list use)
        selectMessage: function() {
            this.$el.addClass('selected');
            this.$el.find('input[type="checkbox"]').prop('checked', true);
        },

        // unselect message (for message list use)
        unselectMessage: function() {
            this.$el.removeClass('selected');
            this.$el.find('input[type="checkbox"]').prop('checked', false);
        },

        // Bookmark this messages
        onBookmark: function() {

            this.model.save({
                bookmarked: selink.user.id // TODO: no need to pass this parameter
            }, {
                url: '/messages/' + this.model.get('_id') + '/bookmark',
                reIsotope: false, // do not re-isotope whole collection, that will cause image flicker
                patch: true,
                wait: true
            });
        },

        // rerender bookmark mark
        renderBookmark: function() {

            if (this.model.get('isMarked'))
                // flip the icon and mark this message as bookmark
                this.ui.bookmarkBtn
                    .removeClass('fa-star-o light-grey')
                    .addClass('fa-star orange')
                    .slFlip();
            else
                // flip the icon and mark this message as unbookmark
                this.ui.bookmarkBtn
                    .removeClass('fa-star orange')
                    .addClass('fa-star-o light-grey')
                    .slFlip();
        },

        showMessage: function() {

            var self = this;

            this.openMessage();

            this.$el.toggleClass('message-inline-open')
                .find('.message-content').slideToggle(0, function() {
                    self.trigger("ensureLayout");
                });
        },

        replyMessage: function(e) {

            // stop default click event
            if (e) e.preventDefault();

            var reply = new MessageModel({
                    subject: 'Re: ' + this.model.get('subject'),
                    content: this.model.get('content'),
                    reference: this.model.get('_id')
                }),
                recipient = new BaseModel(this.model.get('_from'));

            var messageEditor = new MessageEditView({
                model: reply,
                recipient: [recipient]
            });

            selink.modalArea.show(messageEditor);
            selink.modalArea.$el.modal('show');
        },

        removeMessage: function(e) {

            // stop default click event
            if (e) e.preventDefault();

            this.trigger('remove');

            // if the message is unread
            if (this.model.get('isUnread'))
                // also remove it from local user model
                selink.user.messages.remove(this.model.id);
        },

        openMessage: function() {

            if (this.model.get('isUnread'))
                this.model.save({opened: true}, {
                    patch: true,
                    wait: true
                });
        },

        unopenMessage: function() {

            if (!this.model.get('isUnread'))
                this.model.save({opened: false}, {
                    patch: true,
                    wait: true
                });
        },

        markRead: function() {

            if (this.model.get('isUnread')) {
                this.$el.addClass('message-unread');
                selink.user.messages.add(this.model);
            } else {
                this.$el.removeClass('message-unread');
                selink.user.messages.remove(this.model.id);
            }
        }

    });
});