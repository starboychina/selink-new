define([
    'text!common/template/post/create.html',
    'common/view/post/create/preview',
    'common/model/post'
], function(
    template,
    Preview,
    PostModel
) {

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog post-modal',

        // child view container
        childViewContainer: '.ace-thumbnails',

        // child view
        childView: Preview,

        // ui
        ui: {
            textInput: '.wysiwyg-editor',
            btnImage: 'input[name="image"]',
            btnVideo: 'input[name="video"]',
            btnPost: '.btn-post'
        },

        events: {
            'keyup .wysiwyg-editor': 'enablePost',
            'click .btn-post': 'onPost',
            'click .btn-cancel': 'onCancel'
        },

        // child events
        childEvents: {
            'removeImage': 'onRemoveImage'
        },

        // customize attachHtml
        attachHtml: function(collectionView, itemView, index) {

            var self = this;

            // ensure the image are loaded
            itemView.$el.imagesLoaded(function() {
                // prepend new item and reIsotope
                self.$el.find(self.childViewContainer).isotope('insert', itemView.$el);
            });
        },

        // initailizer
        initialize: function() {

            // create image collection
            this.collection = new Backbone.Collection();

            // post has two mode -- 'images' and 'video'
            this.mode = 'images';
        },

        onRender: function() {

            var self = this;

            // initiate wysiwyg eidtor for post edit area
            this.ui.textInput.ace_wysiwyg().prev().addClass('wysiwyg-style3');

            // initiate image upload
            this.ui.btnImage.fileupload({
                type: 'PUT',
                dataType: 'json',
                autoUpload: false,
                // set these two options to false, we get preview as img instead of canvas
                previewCanvas: false,
                previewOrientation: false,
                previewMaxWidth: null,
                previewMaxHeight: null

            }).on('fileuploadprocessalways', function (e, data) {

                // if the view is not in 'images' mode
                if (self.mode !== 'images') {
                    // clear the collection
                    self.collection.reset();
                    // switch to 'images' mode
                    self.mode = 'images';
                }

                // wrap selected image as a model
                var imageModel = new Backbone.Model(data.files[0]);
                // add this model to collection
                self.collection.add(imageModel);

                // upload image
                data.submit().success(function(result, textStatus, jqXHR) {
                    // set the remote name return by server to the model
                    imageModel.set({
                        remoteName: result.remoteName,
                        remoteType: result.remoteType
                    });
                });

            }).on('fileuploadprogress', function (e, data) {

                // calculate upload progress
                var progress = parseInt(data.loaded / data.total * 100, 10);
                // find the image's model and update the progress
                self.collection.findWhere({name: data.files[0].name}).set('progress', progress);
            });

            // initiate video upload
            this.ui.btnVideo.fileupload({
                type: 'PUT',
                dataType: 'json',
                // set these two options to false, we get preview as img instead of canvas
                previewCanvas: false,
                previewOrientation: false

            }).on('fileuploadprocessalways', function (e, data) {

                // clear the collection
                self.collection.reset();

                // switch to 'video' mode
                self.mode = 'video';

                // wrap selected video as a model
                var videoModel = new Backbone.Model(data.files[0]);
                // add this model to collection
                self.collection.add(videoModel);

                // upload video
                data.submit().success(function(result, textStatus, jqXHR) {
                    // set the remote name return by server to the model
                    videoModel.set({
                        remoteName: result.remoteName,
                        remoteType: result.remoteType
                    });
                });

            }).on('fileuploadprogress', function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                self.collection.findWhere({name: data.files[0].name}).set('progress', progress);
            });

        },

        // after show
        onShow: function() {

            var self = this;

            // here we need a time-out call, cause this view is in a modal
            // and the modal will take a piece of time to be visible.
            // isotope only process the visible elements, if we isotope on it immediatly
            // isotope will not work. so I wait 0.5s here (niceScroll also)
            setTimeout(function() {

                // enable isotope
                self.$el.find(self.childViewContainer).isotope({
                    itemSelector : 'li'
                });

            }, 500);
        },

        // remove selected image
        onRemoveImage: function(view) {
            // remove the model
            this.collection.remove(view.model);
            // remove the view
            this.$el.find(this.childViewContainer).isotope('remove', view.$el).isotope('layout');
        },


        // change the status of post button
        enablePost: function() {

            // get user input
            var input = this.ui.textInput.cleanHtml();

            // if user input is not empty
            if (input && !_.str.isBlank(input)) {
                // enable the post button
                this.ui.btnPost.removeClass('disabled');
            } else {
                // disable ths post button
                this.ui.btnPost.addClass('disabled');
            }
        },

        onPost: function() {

            var self = this,
                post = {
                    content: this.ui.textInput.cleanHtml()
                };

            if (this.mode === 'images')
                post.images = _.map(this.collection.toJSON(), function(image) {
                    return {
                        name: image.remoteName,
                        type: image.remoteType
                    };
                });
            else
                post.video = {
                    name: this.collection.toJSON()[0].remoteName,
                    type: this.collection.toJSON()[0].remoteType
                };

            // _.pluck(this.collection.toJSON(), 'remoteName')[0];

            if (this.targetGroup)
                post.group = this.targetGroup.id;

            var newPost = new PostModel();
            newPost.save(post, {

                // show loading icon, and prevent user click twice
                beforeSend: function() {
                    self.ui.btnPost.button('loading');
                },

                success: function(model, response, options) {
                    // clear input area
                    self.ui.newPost.html("");
                },

                error: function(model, xhr, options) {

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
        },

        onCancel: function() {

        }

    });
});