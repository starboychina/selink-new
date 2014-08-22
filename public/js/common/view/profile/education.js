define([
    'common/view/item-base',
    'text!common/template/profile/education.html'
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
                'schoolValue': '.school-value',
                'majorValue': '.major-value',
                'school': 'input[name="school"]',
                'major': 'input[name="major"]',
                'startDate': 'input[name="startDate"]',
                'endDate': 'input[name="endDate"]',
                'remove': '.btn-remove'
            });

            this.events = _.extend({}, this.events, {
                'change input[name="school"]': 'updateModel',
                'change input[name="major"]': 'updateModel',
                'change input[name="startDate"]': 'updateModel',
                'change input[name="endDate"]': 'updateModel',
                'click .btn-remove': 'removeModel'
            });
        },

        // after render
        onRender: function() {

            // append data picker
            this.$el.find('input[name="startDate"],input[name="endDate"]').datepicker({
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
            this.$el.find('input[name="startDate"],input[name="endDate"]').datepicker('remove');
        },

        // update model
        updateModel: function() {

            // clear all errors
            this.clearError();

            // get user input data
            var inputData = this.getData();

            // check input value
            var errors = this.model.preValidate(inputData) || {};

            // check wheter end date is after start date
            if (this.ui.endDate.val()) {

                // looks very bad, but work
                var startDate = new Date(this.ui.startDate.val()),
                    endDate = new Date(this.ui.endDate.val());

                if (moment(startDate).isAfter(endDate))
                    errors.endDate = errors.endTime = "開始日より後の時間をご入力ください";
            }

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

            var startDate = this.ui.startDate.val() ? moment(this.ui.startDate.val(), 'YYYY/MM').toJSON() : "",
                endDate = this.ui.endDate.val() ? moment(this.ui.endDate.val(), 'YYYY/MM').toJSON() : "";

            return {
                school: this.ui.school.val(),
                major: this.ui.major.val(),
                startDate: startDate,
                endDate: endDate
            };
        },

        // render view with new value
        renderValue: function(data) {

            if (data.school)
                this.ui.schoolValue.text(data.school);
            else
                this.ui.schoolValue.html('<span class="text-muted">学校名称</span>');

            if (data.major)
                this.ui.majorValue.html('<span class="label label-sm label-success arrowed arrowed-right">' + data.major + '</span>');
            else
                this.ui.majorValue.empty();

            this.$el.find('small').remove();

            if (data.startDate || data.endDate) {

                var duration = "";

                if (data.startDate && !data.endDate)
                    duration = moment(data.startDate).format('YYYY年M月') + "〜";
                else if (!data.startDate && data.endDate)
                    duration = "〜" + moment(data.endDate).format('YYYY年M月');
                else if (data.startDate && data.endDate)
                    duration = moment(data.startDate).format('YYYY年M月') + "〜" + moment(data.endDate).format('YYYY年M月');

                this.$el.find('blockquote').append('<small>' + duration + '</small>');
            }
        }
    });
});