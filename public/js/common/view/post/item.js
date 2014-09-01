define([
    'text!common/template/post/item.html',
    'text!common/template/people/popover.html',
    'text!common/template/group/popover.html',
    'common/collection/base',
    'common/view/post/comment'
], function(
    template,
    peoplePopoverTemplate,
    groupPopoverTemplate,
    BaseCollection,
    ItemView
) {

    return Backbone.Marionette.CompositeView.extend({

        // class name
        className: 'isotope-item col-xs-12 col-sm-6 col-lg-4',

        // template
        template: template,

        // child view container
        childViewContainer: '.dialogs',

        // child view
        childView: ItemView,

        // ui
        ui: {
            avatar: '.avatar',
            groupLabel: '.group-label',

            menuToggler: '.widget-header .widget-toolbar',
            removeBtn: '.btn-remove',
            forbidBtn: '.btn-forbid',

            alert: '.alert',
            cancelBtn: '.btn-remove-cancel',
            confirmBtn: '.btn-remove-confirm',

            editable: '.sl-editable',
            postContent: '.content',
            postEditor: '.sl-editor',
            editorTool: '.editor-toolbox',
            saveBtn: '.btn-save',
            editCancelBtn: '.btn-edit-cancel',

            detailBtn: '.btn-detail',
            likeBtn: '.btn-like',
            bookmarkBtn: '.btn-bookmark',
            showAllBtn: '.btn-show-all',

            comments: '.dialogs',
            replyLabel: '.reply-label',
            replyTarget: '.reply-label span',
            replyCancelBtn: '.reply-label button',
            commentInput: 'textarea[name="comment"]',
            commentConfirmBtn: '.btn-comment',
            commentCancelBtn: '.btn-cancel',
        },

        // events
        events: {
            'mouseover': 'toggleMenuIndicator',
            'mouseout': 'toggleMenuIndicator',

            'click @ui.avatar': 'toProfile',
            'click @ui.groupLabel': 'toGroup',

            'click @ui.postContent': 'toggleExpand',
            'click @ui.removeBtn': 'showAlert',
            'click @ui.forbidBtn': 'toggleForbid',
            'click @ui.cancelBtn': 'hideAlert',
            'click @ui.confirmBtn': 'onRemove',
            'click @ui.editable': 'showEditor',
            'click @ui.editCancelBtn': 'hideEditor',
            'click @ui.saveBtn': 'onSave',
            'keyup @ui.postEditor': 'enableSave',

            'click @ui.likeBtn': 'onLike',
            'click @ui.bookmarkBtn': 'onBookmark',
            'click @ui.showAllBtn': 'showAllComment',

            'focusin @ui.commentInput': 'openComment',
            'keyup @ui.commentInput': 'checkComment',
            'click @ui.commentConfirmBtn': 'onComment',
            'click @ui.commentCancelBtn': 'closeComment',
            'click @ui.replyCancelBtn': 'cancelReply'
        },

        modelEvents: {
            'change:content': 'renderContent',
            'change:like': 'renderLike',
            'change:bookmark': 'renderBookmark',
        },

        collectionEvents: {
            'add': 'renderComments',
        },

        childEvents: {
            'remove': 'onCommentRemove',
            'reply': 'onReply',
            'ensureLayout': 'proxyEnsureLayout'
        },

        // override attachHtml
        attachHtml: function(collectionView, itemView, index) {

            if (!this.options.modal && index < this.collection.length - 3)
                itemView.$el.addClass('hide');
            // prepend comment to container, later comments comeout first
            this.ui.comments.prepend(itemView.el);
        },

        // initializer
        initialize: function() {

            // post is collapsed in the beginning
            this.expanded = false;

            // comment reply target
            this.replyTo = null;

            // create comments collction
            this.collection = this.model.comments;

        },

        // after render
        onRender: function() {

            this.ui.postEditor.ace_wysiwyg({
                toolbar_place: function(toolbar) {
                    return $(this).closest('.widget-box').find('.btn-toolbar').prepend(toolbar).children(0).addClass('inline');
                }
            }).prev().addClass('wysiwyg-style3');

            // if this post belong to some group
            if (this.model.get('group'))
                // add popover on group label
                this.ui.groupLabel.popover({
                    html: true,
                    trigger: 'hover',
                    container: 'body',
                    placement: 'auto right',
                    title: '<img src="' + this.model.get('group').cover + '" />',
                    content: _.template(groupPopoverTemplate, this.model.get('group')),
                });

            // add popover on author photo
            this.ui.avatar.popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.get('_owner').cover + '" />',
                content: _.template(peoplePopoverTemplate, this.model.get('_owner')),
            });

            this.ui.editable.tooltip({
                placement: 'bottom',
                title: "クリックして編集"
            });

            // add tooltip on add button
            this.ui.likeBtn.tooltip({
                placement: 'top',
                title: "いいね！"
            });

            this.ui.bookmarkBtn.tooltip({
                placement: 'top',
                title: "ブックマーク"
            });

            this.ui.detailBtn.tooltip({
                placement: 'top',
                title: "もっと見る"
            });
        },

        // after show
        onShow: function() {

            var self = this;

            // use setTimeout to delay the activiation of niceScroll
            // or it will calulate it's position wrong. I wait 1.2s for the wrost case
            setTimeout(function() {
                // make content scrollable
                self.ui.postContent.niceScroll({
                    horizrailenabled: false,
                    railoffset: {
                        left: 11
                    }
                });
            }, 1200);
        },

        // show operation menu toggler
        toggleMenuIndicator: function() {
            this.ui.menuToggler.toggleClass('hidden');
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on user's photo
            this.ui.avatar.popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.get('_owner')._id;
        },

        // turn to group page
        toGroup: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on group label
            this.ui.groupLabel.popover('destroy');
            // turn the page manually
            window.location = '#group/' + this.model.get('group')._id;
        },

        // show remove confirm alert
        showAlert: function(event) {

            var self = this;

            // stop defautl link behavior
            event.preventDefault();
            // show remove confirm alert
            this.ui.alert
                .slideDown('fast', function() {
                    self.trigger("ensureLayout");
                })
                .find('i')
                .addClass('icon-animated-vertical');
        },

        // hide remove confirm alert
        hideAlert: function() {

            var self = this;

            this.ui.alert
                .slideUp('fast', function() {
                    self.trigger("ensureLayout");
                });
        },

        // remove post
        onRemove: function() {

            // parent view handle remove
            this.trigger('remove');
        },

        // forbid/allow comment
        toggleForbid: function(event) {

            var self = this;

            // stop defautl link behavior
            event.preventDefault();
            // toggle model commentable setting
            this.model.save({
                'setting.commentable': !this.model.get('setting.commentable')
            }, {
                success: function() {
                    // hide comment area
                    self.$el.find('.widget-toolbox').toggleClass('hidden');
                    // toggle forbid button status
                    self.$el.find('.btn-forbid').closest('li').toggleClass('hidden');
                    self.trigger("ensureLayout");
                },
                patch: true,
                wait: true
            });
        },

        // rerender post content
        renderContent: function() {
            this.ui.postContent.empty().html(this.model.get('content'));
            this.trigger("ensureLayout");
        },

        // expand post content to full screen
        toggleExpand: function() {

            // remove the gird class
            this.$el.toggleClass('col-sm-6 col-lg-4');

            // toggle post status
            this.expanded = !this.expanded;

            // re-isotope
            this.trigger("ensureLayout");
            this.trigger("expand");
        },

        // show post editor
        showEditor: function() {

            var self = this;

            // if the post is collapsed
            if (!this.expanded)
                // expand it to full screen
                this.toggleExpand();

            // show save cancel button
            this.ui.saveBtn.removeClass('hidden');
            this.ui.editCancelBtn.removeClass('hidden');

            // hide content display area
            this.ui.postContent.slideUp('fast', function() {

                // show editor tool box
                self.ui.editorTool.slideDown('fast');

                // show editor
                self.ui.postEditor.slideDown('fast', function() {

                    // re-isotope
                    self.trigger("ensureLayout");
                });
            });
        },

        // hide post editor
        hideEditor: function() {

            var self = this;

            // at this point, post box must be expanded, callapse it
            this.toggleExpand();

            // hide save cancel button
            this.ui.saveBtn.addClass('hidden');
            this.ui.editCancelBtn.addClass('hidden');

            // hide editor tool box
            this.ui.editorTool.slideUp('fast');

            // hide editor
            this.ui.postEditor.slideUp('fast', function() {

                // show content display area
                self.ui.postContent.slideDown('fast', function() {

                    // re-isotope
                    self.trigger("ensureLayout");
                });
            });
        },

        // change the status of editor save button
        enableSave: function() {

            // get user input
            var input = this.ui.postEditor.cleanHtml();

            // if user input is not empty
            if (input && !_.str.isBlank(input)) {
                // enable the post button
                this.ui.saveBtn.removeClass('disabled');
            } else {
                // disable ths post button
                this.ui.saveBtn.addClass('disabled');
            }
        },

        // update post content
        onSave: function() {

            var self = this;

            this.model.save({
                content: this.ui.postEditor.cleanHtml()
            }, {
                success: function(model, response, options) {
                    self.ui.postContent.empty().html(model.get('content'));
                    self.hideEditor();
                },
                // reIsotope: false, // do not re-isotope whole collection, that will cause image flicker
                patch: true,
                wait: true
            });
        },

        // like this posts
        onLike: function(event) {

            // stop defautl link behavior
            event.preventDefault();

            this.model.save({}, {
                url: '/posts/' + this.model.get('_id') + '/like',
                patch: true,
                wait: true
            });
        },

        // rerender like mark
        renderLike: function() {

            // update the like number
            this.ui.likeBtn
                .find('span')
                .empty()
                .text(this.model.get('like').length);
            // flip the icon and toggle the like status
            this.ui.likeBtn
                .find('i')
                .toggleClass('fa-heart-o fa-heart')
                .slFlip();
        },

        // Bookmark this posts
        onBookmark: function(event) {

            // stop defautl link behavior
            event.preventDefault();

            this.model.save({}, {
                url: '/posts/' + this.model.get('_id') + '/bookmark',
                patch: true,
                wait: true
            });
        },

        // rerender bookmark mark
        renderBookmark: function() {

            // flip the icon and mark this post as bookmark
            this.ui.bookmarkBtn
                .find('i')
                .toggleClass('fa-star-o fa-star')
                .slFlip();
        },

        // display all comments
        showAllComment: function() {

            var self = this;

            this.ui.comments.find('.hide').removeClass('hide').slideDown(function() {
                self.ui.showAllBtn.hide();
                self.trigger("ensureLayout");
            });
        },

        // open the comment area
        openComment: function() {

            var self = this;

            this.$el.find('.comment-area').css('margin-left', '58px');
            this.$el.find('.photo-area').slideDown();
            this.$el.find('.btn-area').slideDown('fast', function() {
                // enable autosize on comment area
                self.ui.commentInput.autosize({
                    callback: function() {
                        setTimeout(function() {
                            self.trigger("ensureLayout");
                        }, 200);
                    }
                });
            });
        },

        // close the comment area
        closeComment: function() {

            var self = this;

            this.replyTo = null;

            this.$el.find('.comment-area').css('margin-left', '0px');
            this.$el.find('.photo-area').hide();
            this.ui.replyLabel.slideUp('fast', function() {
                self.$el.find('.btn-area').slideUp('fast', function() {
                    self.ui.commentInput.val('').trigger('autosize.destroy');
                    self.trigger("ensureLayout");
                });
            });
        },

        // check comment input
        checkComment: function() {

            // if the comment input is not blank
            if (!_.str.isBlank(this.ui.commentInput.val()))
            // enable comment button
                this.ui.commentConfirmBtn.removeClass('disabled');
            else
            // disable comment button
                this.ui.commentConfirmBtn.addClass('disabled');
        },

        // comment this post
        onComment: function() {

            var self = this;

            // replace newline in text to html newline
            var comment = this.ui.commentInput.val().replace(/(?:\r\n|\r|\n)/g, '<br />');

            // create new comment
            this.collection.create({
                content: comment,
                replyTo: this.replyTo
            }, {
                success: function() {

                    // if this is the first comment
                    if (self.collection.length == 1)
                        // add a separator
                        self.ui.comments.before("<hr>");
                    // close the comment area
                    self.closeComment();
                },
                wait: true
            });
        },

        // rerender comments
        renderComments: function() {
            this.trigger("ensureLayout");
        },

        // remove comment
        onCommentRemove: function(view) {

            var self = this;

            view.$el.slideUp('fast', function() {

                view.model.destroy({
                    success: function(model, response) {
                        self.trigger("ensureLayout");
                    },
                    wait: true
                });
            });
        },

        // reply comment
        onReply: function(view) {

            var self = this,
                person = view.model.get('_owner'),
                atPerson = "@" + person.firstName + ' ' + person.lastName + ' ';

            this.replyTo = view.model.id;

            this.ui.replyTarget.empty().text(atPerson);
            this.ui.replyLabel.slideDown('fast', function() {
                self.trigger("ensureLayout");
            });
            this.openComment();

            $('html,body').animate({
                scrollTop: this.$el.find('.comment-area').offset().top - 150
            }, 1000);
        },

        cancelReply: function() {

            var self = this;

            this.replyTo = null;

            this.ui.replyLabel.slideUp('fast', function() {
                self.trigger("ensureLayout");
            });
        },

        // child view size changed
        proxyEnsureLayout: function() {
            // fire ensure layout event to re-layout
            this.trigger("ensureLayout");
        }

    });
});
