define([
    'text!admin/template/announcement/item.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // class name
        className: 'isotope-item col-xs-12 col-sm-6 col-lg-4',

        // template
        template: template,

        // ui
        ui: {
            contentArea: '.content',
            editArea: '.wysiwyg-editor',
            alertArea: '.alert',
            saveBtn: '.btn-save',
            menuToggler: '.widget-header .widget-toolbar'
        },

        // events
        events: {
            'click .btn-save': 'onSave',
            'click .btn-remove': 'showAlert',
            'click .btn-remove-cancel': 'hideAlert',
            'click .btn-remove-comfirm': 'onRemove',
            'click .btn-detail': 'showDetail',
            'keyup .wysiwyg-editor': 'enableSave',
            'mouseover': 'toggleMenuIndicator',
            'mouseout': 'toggleMenuIndicator'
        },

        modelEvents: {
            'change:content': 'renderContent',
        },

        // initializer
        initialize: function() {

            if (this.options.modal)
                this.$el.removeClass(this.className).addClass('modal-dialog post-modal');

            // if the viewer is administrator
            if (selink.user.get('type') === "admin")
            // mark his user type
                this.model.set('isAdmin', true, {
                    silent: true
                });
        },

        // after render
        onRender: function() {

            // initiate wysiwyg eidtor for memo
            this.ui.editArea.ace_wysiwyg().prev().addClass('wysiwyg-style3');
        },

        // show the comfirm alert
        showAlert: function(event) {

            event.preventDefault();

            var self = this;

            this.ui.alertArea
                .slideDown('fast', function() {
                    self.trigger("ensureLayout");
                })
                .find('i')
                .addClass('icon-animated-vertical');
        },

        // hide confirm alert
        hideAlert: function() {

            var self = this;

            this.ui.alertArea
                .slideUp('fast', function() {
                    self.trigger("ensureLayout");
                });
        },

        // remove post
        onRemove: function() {

            this.trigger('remove');

            // if this is a detail view
            if (this.options.modal)
                // hide the modal dialog
                selink.modalArea.$el.modal('hide');
        },

        // show detail view
        showDetail: function() {

            // detail use the same view just like this
            // but pass an custom option "modal: true", view will switch template by this
            var detailView = new this.constructor({
                model: this.model,
                modal: true
            });

            // detail also has a "remove" button, emit remove event
            // for achive the same behavior of composite-isotope view, have delegate it to this view
            this.listenTo(detailView, 'remove', this.onRemove);

            selink.modalArea.show(detailView);
            selink.modalArea.$el.modal('show');
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
        },

        renderContent: function() {
            this.ui.contentArea.empty().html(this.model.get('content'));
            this.trigger("ensureLayout");
        },

        // show operation menu indicator
        toggleMenuIndicator: function() {
            this.ui.menuToggler.toggleClass('hidden');
        }

    });
});
