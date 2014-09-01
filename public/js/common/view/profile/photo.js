define([
    'common/view/item-base',
    'text!common/template/profile/photo.html',
    'common/view/profile/photo-crop'
], function(
    BaseView,
    template,
    CropView
) {

    return BaseView.extend({

        // template
        template: template,

        modelEvents: {
            'change:photo': 'updatePhoto',
            'change': 'updateCompleteness'
        },

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                photo: 'img',
                inputFile: 'input[type="file"]',
                progress: '.progress',
                bar: '.progress-bar'
            });

            this.model.set({'completeness': this.model.completeness()}, {silent: true});

            this.listenTo(this.model.qualifications, 'change', this.updateCompleteness);
            this.listenTo(this.model.qualifications, 'remove', this.updateCompleteness);

            this.listenTo(this.model.languages, 'change', this.updateCompleteness);
            this.listenTo(this.model.languages, 'remove', this.updateCompleteness);

            this.listenTo(this.model.skills, 'change', this.updateCompleteness);
            this.listenTo(this.model.skills, 'remove', this.updateCompleteness);

            this.listenTo(this.model.educations, 'change', this.updateCompleteness);
            this.listenTo(this.model.educations, 'remove', this.updateCompleteness);

            this.listenTo(this.model.employments, 'change', this.updateCompleteness);
            this.listenTo(this.model.employments, 'remove', this.updateCompleteness);
        },

        onRender: function() {

            var self = this;

            this.ui.photo.colorbox();

            this.ui.inputFile.fileupload({
                type: 'PUT',
                dataType: 'json',
                done: function(e, data) {

                    self.model.set('photoOriginal', data.result.fileName);

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

        updatePhoto: function() {

            var self = this;

            this.ui.photo.slRollOut('', function() {
                $(this).attr('src', self.model.get('photo'));
                $(this).removeClass('rollOut').addClass('rollIn');
            });
        },

        updateCompleteness: function() {

            var completeness = this.model.completeness(),
                progressClass = "progress-bar";

            if (completeness == 100) {
                progressClass += ' progress-bar-success';
            } else if (completeness > 85) {
                // progressClass = 'progress-bar';
            } else if (completeness > 70) {
                progressClass += ' progress-bar-warning';
            } else if (completeness > 50) {
                progressClass += ' progress-bar-pink';
            } else if (completeness > 30) {
                progressClass += ' progress-bar-purple';
            } else {
                progressClass += ' progress-bar-danger';
            }

            this.ui.progress.attr('data-percent', completeness + '%');
            this.ui.bar.removeClass().addClass(progressClass);
            this.ui.bar.css('width', completeness + '%');
        }
    });
});