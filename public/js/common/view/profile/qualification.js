define([
    'common/view/item-base',
    'text!common/template/profile/qualification.html'
], function(
    BaseView,
    template) {

    return BaseView.extend({

        // template
        template: template,

        // class name
        className: 'sl-editable',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'nameValue': '.name-value',
                'date': 'input[name="acquireDate"]',
                'name': 'input[name="name"]',
                'remove': '.btn-remove'
            });

            this.events = _.extend({}, this.events, {
                'change input[name="acquireDate"]': 'updateModel',
                'change input[name="name"]': 'updateModel',
                'click .btn-remove': 'removeModel'
            });
        },

        // after render
        onRender: function() {

            // append data picker
            this.ui.date.datepicker({
                autoclose: true,
                startView: 2,
                minViewMode: 1,
                endDate: new Date(),
                format: 'yyyy/mm',
                language: 'ja'
            });

            // bind validator
            Backbone.Validation.bind(this);
        },

        // before destroy
        onBeforeDestroy: function() {
            // close datepicker
            this.ui.date.datepicker('remove');
        },

        // update model
        updateModel: function() {

            // clear all errors
            this.clearError();

            // get input data
            var inputData = this.getData();

            // check input data
            var errors = this.model.preValidate(inputData) || {};

            // if input has no errors
            if (_.isEmpty(errors)) {
                // set value on model
                this.model.set(inputData);
                // render view with new value
                this.renderValue(inputData);
            } else {
                // show error
                this.showError(errors);
            }
        },

        // remove model
        removeModel: function() {

            var self = this;

            // hide view first
            this.$el.slBounceOut('', function(){
                $(this).removeClass('animated bounceOut');
                // remove model
                self.model.collection.remove(self.model);
            });
        },

        // get user input data
        getData: function() {

            var acquireDate = this.ui.date.val() ? moment(this.ui.date.val(), 'YYYY/MM').toJSON() : "";

            return {
                name: this.ui.name.val(),
                acquireDate: acquireDate
            };
        },

        // render view with new value
        renderValue: function(data) {

            if (data.name)
                this.ui.nameValue.text(data.name);
            else
                this.ui.nameValue.html('<span class="text-muted">資格名称</span>');

            this.$el.find('small').remove();

            if (data.acquireDate)
                this.$el.find('blockquote').append('<small>取得日： ' + moment(data.acquireDate).format('YYYY年M月') + '</small>');
        }
    });
});