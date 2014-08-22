define([
    'text!common/template/post/detail.html',
    'common/view/post/item'
], function(
    template,
    BaseView
) {

    return BaseView.extend({

        // class name
        className: 'modal-dialog post-modal',

        // template
        template: template,

        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                editArea: '.wysiwyg-editor',
                saveBtn: '.btn-save',
            });

            this.events = _.extend({}, this.events, {
                'click .btn-save': 'onSave',
                'click .btn-detail': 'showDetail',
                'keyup .wysiwyg-editor': 'enableSave'
            });

            // call super initializer
            BaseView.prototype.initialize.apply(this);
        },

        // after render
        onRender: function() {

            // call super initializer
            BaseView.prototype.onRender.apply(this);

            // initiate wysiwyg eidtor for memo
            this.ui.editArea.ace_wysiwyg().prev().addClass('wysiwyg-style3');
        },

        // remove post
        onRemove: function() {

            this.model.destroy({
                success: function() {
                    // hide the modal dialog
                    selink.modalArea.$el.modal('hide');
                },
                wait: true
            });
        },

        // change the status of save button
        enableSave: function() {

            // get user input
            var input = this.ui.editArea.cleanHtml();

            // if user input is not empty
            if (input && !_.str.isBlank(input)) {
                // enable the post button
                this.ui.saveBtn.removeClass('disabled');
            } else {
                // disable ths post button
                this.ui.saveBtn.addClass('disabled');
            }
        },

        onSave: function() {

            this.model.save({
                content: this.ui.editArea.cleanHtml()
            }, {
                success: function(model, response, options) {
                    selink.modalArea.$el.modal('hide');
                },
                reIsotope: false, // do not re-isotope whole collection, that will cause image flicker
                patch: true,
                wait: true
            });
        }

    });
});