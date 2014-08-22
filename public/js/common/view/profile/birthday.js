define([
    'common/view/item-base',
    'text!common/template/profile/birthday.html'
], function(
    BaseView,
    template
) {

    return BaseView.extend({

        // template
        template: template,

        // className
        className: 'row form-group',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            // update model when input value changed
            this.events = _.extend({}, this.events, {
                'change input': 'updateModel'
            });

            // listen on birthDay property for save
            this.modelEvents = {
                'change:birthDay': 'save'
            };
        },

        // after render
        onRender: function() {

            // append data picker
            this.ui.input.datepicker({
                autoclose: true,
                forceParse: false,
                startView: 2,
                endDate: new Date(),
                language: 'ja'
            });
        },

        // remove the datepicker before close
        onBeforeDestroy: function() {
            this.ui.input.datepicker('remove');
        },

        // reflect user input on model
        updateModel: function() {

            // clear all errors
            this.clearError();

            // check input value
            var errors = this.model.preValidate(this.getData());

            // if input has errors
            if (errors) {
                // show error
                this.showError(errors);
            } else {
                // set value on model
                this.model.set(this.getData());
            }
        },

        // get user input data
        getData: function() {

            if (!_.isEmpty(this.ui.input.val()))
                return {
                    birthDay: moment(this.ui.input.val()).toJSON()
                };
            else
                return {
                    birthDay: null
                };
        },

        // render value by user input data
        renderValue: function(data) {

            // if user input nothing
            if (!data.birthDay) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value by local format
            this.ui.value.text(moment(data.birthDay).format('LL'));
        }

    });
});