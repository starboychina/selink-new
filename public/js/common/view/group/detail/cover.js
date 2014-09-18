define([
    'text!common/template/group/detail/cover.html',
    'common/view/group/detail/cover-crop'
], function(
    template,
    CropView
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        ui: {
            cover: 'img',
            inputFile: 'input[type="file"]',
        },

        events: {
            'mouseover': 'showUploadBtn',
            'mouseout': 'hideUploadBtn'
        },

        modelEvents: {
            'change:cover': 'updateCover',
        },

        onRender: function() {

            var self = this;

            this.ui.inputFile.fileupload({
                type: 'PUT',
                dataType: 'json',
                done: function(e, data) {

                    self.model.set('coverOriginal', data.result.fileName);

                    var cropView = new CropView({model: self.model});

                    selink.modalArea.show(cropView);
                    selink.modalArea.$el.modal('show');
                },
                error: function() {
                    // show error
                    $.gritter.add({
                        title: 'ファイルアップロードが失敗しました',
                        text: '画像は「jpg」、「gif」、「png」のフォーマットのみ受け付けます。お手数ですが、お確かめ上に、もう一度アップロードしてください。',
                        class_name: 'gritter-error'
                    });
                }
            });
        },

        updateCover: function() {

            var self = this;

            this.ui.cover.slAnimated('fadeOutUp', '', function() {
                $(this).attr('src', self.model.get('cover_ref'));
                $(this).removeClass('fadeOutUp').addClass('fadeInDown');
            });
        },

        showUploadBtn: function() {
            this.$el.find('.fileinput-button').removeClass('hide');
        },

        hideUploadBtn: function() {
            this.$el.find('.fileinput-button').addClass('hide');
        }

    });
});