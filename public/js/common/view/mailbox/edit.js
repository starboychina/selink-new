define([
    'text!common/template/mailbox/edit.html',
    'common/model/message'
], function(
    template,
    MessageModel
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // this view is a modal dialog
        className: 'modal-dialog message-modal',

        // ui
        ui: {
            recipient: 'input[name="recipient"]',
            subject: 'input[name="subject"]',
            message: '.wysiwyg-editor'
        },

        // events
        events: {
            'click .btn-send': 'onSend'
        },

        // initializer
        initialize: function() {

            if (!this.model)
                this.model = new MessageModel();
        },

        onShow: function() {

            // enable wysiwyg editor
            this.ui.message.ace_wysiwyg().prev().addClass('wysiwyg-style3');

            // instantiate the bloodhound suggestion engine
            var userName = new Bloodhound({
                datumTokenizer: function(d) {

                    if (d.firstName) {
                        return Bloodhound.tokenizers.whitespace(d.firstName + ' ' + d.lastName);
                    }
                        else return '';
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: '/suggest/user?initial=%QUERY'
                // local: selink.user.friends.models
            });

            // initialize the bloodhound suggestion engine
            userName.initialize();

            // in the recipient field, enable the tag input
            this.$el.find('input[name="recipient"]').tag({
                placeholder: "宛先（氏名）",
                recipient: this.options.recipient,
                ttOptions: {
                    highlight: true
                },
                ttSource: {
                    name: 'friends',
                    displayKey: function(d) {
                        return d.firstName + ' ' + d.lastName;
                    },
                    source: userName.ttAdapter(),
                    templates: {
                        suggestion: function(d) {
                            return _.template([
                                '<div>',
                                '<p class="repo-language" style="margin-right: 8px;"><img src="<%= photo_ref %>" style="max-width: 50px;"></p>',
                                '<p class="repo-name"><%= firstName %>&nbsp;<%= lastName %></p>',
                                '<div style="clear: both"></div>',
                                '</div>'
                                ].join(''), d);
                        }
                    }
                }
            });

            // bind validator
            Backbone.Validation.bind(this);
        },

        onSend: function() {

            var inputs = {
                recipient: _.pluck(this.$el.find('input[name="recipient"]').data('models'), '_id'),
                subject: this.ui.subject.val(),
                content: this.ui.message.cleanHtml()
            };

            if (_.isEmpty(this.checkInput(inputs))) {

                this.model.save(inputs, {
                    success: function() {
                        selink.modalArea.$el.modal('hide');
                    },
                    silent: true,
                    patch: true,
                    wait: true
                });
            }
        },

        // check input
        checkInput: function(inputs) {

            // check input
            var errors = this.model.preValidate(inputs) || {};

            // clear errors
            this._clearError();

            // show errors, if any
            this._showError(errors);

            // return errors
            return errors;
        },

        // show input validation error on the view
        _showError: function(errors) {

            for (var key in errors) {

                // recipient special treatment
                if (key == "recipient") {

                    this.ui.recipient.parent('.tags')
                        .addClass('tooltip-error')
                        .css({
                            'border-color': '#f09784'
                        })
                        .tooltip({
                            placement: 'bottom',
                            title: errors[key]
                        })
                        .closest('.form-group')
                        .addClass('has-error')
                        .find('i')
                        .addClass('animated-input-error');

                    continue;
                }

                this.$el.find('input[name="' + key + '"]')
                    .addClass('tooltip-error')
                    .tooltip({
                        placement: 'bottom',
                        title: errors[key]
                    })
                    .closest('.form-group')
                    .addClass('has-error')
                    .find('i')
                    .addClass('animated-input-error');
            }
        },

        // clear input validation error
        _clearError: function() {

            this.$el.find('input')
                .removeClass('tooltip-error')
                .tooltip('destroy')
                .closest('.form-group')
                .removeClass('has-error')
                .find('i')
                .removeClass('animated-input-error');

            // recipient special treatment
            this.$el.find('.tags')
                .removeClass('tooltip-error')
                .css({
                    'border-color': null
                })
                .tooltip('destroy');
        }

    });
});