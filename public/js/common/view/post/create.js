define([
    'text!common/template/post/create.html',
    'common/view/post/create/media'
], function(
    template,
    MediaCreateView
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // ui
        ui: {
            btnMedia: '.btn-media',
            btnText: '.btn-text',
            inputFile: 'input[type="file"]'
        },

        // events
        events: {
            // 'change input[type="file"]': 'onMediaSelect',
            'click @ui.btnText': 'onTextClick',
        },

        // Initializer
        initialize: function() {

            var mediaCreateView;
        },

        onRender: function() {

            var self = this;

            this.ui.inputFile.fileupload({
                type: 'PUT',
                dataType: 'json',
                change: function(e, data) {

                    self.mediaCreateView = new MediaCreateView();

                    selink.modalArea.show(self.mediaCreateView);
                    selink.modalArea.$el.modal('show');
                },
                done: function(e, data) {

                    self.mediaCreateView.finish(data.result);

                    // self.model.set('photoOriginal', data.result.fileName);

                    // var cropView = new CropView({model: self.model});

                    // selink.modalArea.show(cropView);
                    // selink.modalArea.$el.modal('show');
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
        }

    });
});