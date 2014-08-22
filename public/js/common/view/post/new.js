define([
    'text!common/template/post/new.html',
    'common/collection/base',
    'common/view/post/group'
], function(
    template,
    BaseCollection,
    ItemView
) {

    // groups that the user participating
    var GroupsCollection = BaseCollection.extend({

        // we don't need group model, cause we only request for group's id, name and cover
        // this will save some performance on server. and skip parsing on client model also
        // save the performance on client.

        url: function() {
            return '/users/' + this.document.id + '/groups';
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // class name
        className: 'widget-box widget-color-green',

        // child view container
        childViewContainer: '.dropdown-menu',

        // child view
        childView: ItemView,

        // ui
        ui: {
            newPost: '.wysiwyg-editor',
            btnPost: '.btn-post'
        },

        // events
        events: {
            'click .btn-post': 'onPost',
            'keyup .wysiwyg-editor': 'enablePost',
            'click .btn-cancel': 'onGroupClear'
        },

        // child events
        childEvents: {
            'selected': 'onGroupSelect'
        },

        // initializer
        initialize: function() {

            if (this.options.targetGroup) {

                this.model = this.options.targetGroup;
                this.targetGroup = this.options.targetGroup;
            }
            else {
                // create posts collection
                this.collection = new GroupsCollection(null, {document: selink.user});
                // populate collection
                this.collection.fetch();
            }

        },

        // on render
        onRender: function() {

            // initiate wysiwyg eidtor for post edit area
            this.ui.newPost.ace_wysiwyg({
                toolbar_place: function(toolbar) {
                    return $(this).closest('.widget-box').find('.btn-toolbar').prepend(toolbar).children(0).addClass('inline');
                }
            }).prev().addClass('wysiwyg-style3');

            // this.ui.newPost.niceScroll();
        },

        // on post target group selected
        onGroupSelect: function(event, model) {

            // change label text
            this.$el.find('.group-name').empty().text(model.get('name'));
            // hold the selected group
            this.targetGroup = model;
        },

        // on post target group canceled
        onGroupClear: function() {

            // change label text
            this.$el.find('.group-name').empty().text('グループ指定なし');
            // clear the target group
            this.targetGroup = null;
        },

        // change the status of post button
        enablePost: function() {

            // get user input
            var input = this.ui.newPost.cleanHtml();

            // if user input is not empty
            if (input && !_.str.isBlank(input)) {
                // enable the post button
                this.ui.btnPost.removeClass('disabled');
            } else {
                // disable ths post button
                this.ui.btnPost.addClass('disabled');
            }
        },

        // new post
        onPost: function() {

            var self = this,
                post = {
                    content: this.ui.newPost.cleanHtml()
                };

            if (this.targetGroup)
                post.group = this.targetGroup.id;

            // create new post
            this.options.targetCollection.create(post, {

                // show loading icon, and prevent user click twice
                beforeSend: function() {
                    self.ui.btnPost.button('loading');
                },

                success: function(model, response, options) {
                    // clear input area
                    self.ui.newPost.html("");
                },

                error: function(model, xhr, options) {

                    if (xhr.status === 413)
                        // show error
                        $.gritter.add({
                            title: '投稿は失敗しました',
                            text: 'ご投稿した内容のサイズは大きすぎたため、投稿は受入ませんでした。画像を含めて投稿する場合は、直接に画像を挿入せずに、画像リンクをご利用ください。',
                            class_name: 'gritter-error',
                            time: 12000,
                        });
                },

                complete: function() {
                    self.ui.btnPost.button('reset');
                    // disable post button (can't post empty)
                    self.ui.btnPost.addClass('disabled');
                },
                wait: true
            });
        }

    });
});