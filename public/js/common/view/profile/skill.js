define([
    'common/view/item-base',
    'text!common/template/profile/skill.html'
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
                'input': 'input',
                'progress': '.progress-bar',
                'valIndicator': '.fa-nothing',
                'slider': '.sl-slider',
                'remove': '.btn-remove'
            });

            this.events = _.extend({}, this.events, {
                'change input': 'updateModel',
                'click .btn-remove': 'removeModel',
                'typeahead:selected': 'ttUpdateModel'
            });

            this.listenTo(this, 'slider', this.updateModel);
        },

        // after render
        onRender: function() {

            var self = this;

            // instantiate the bloodhound suggestion engine
            var suggestion = new Bloodhound({
                datumTokenizer: function(d) {
                    if (d.name) {
                        return Bloodhound.tokenizers.whitespace(d.name);
                    }
                    else return '';
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: '/suggest/tag?initial=%QUERY',
                limit: 8
            });

            // initialize the bloodhound suggestion engine
            suggestion.initialize();

            // setup typeahead
            this.ui.input.typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            }, {
                name: 'name',
                displayKey: function(d) {
                    return d.name;
                },
                source: suggestion.ttAdapter()
            });

            // attach slider
            this.$el.find('.sl-slider').empty().slider({
                value: this.model.get('weight'),
                range: "min",
                animate: true,
                min: 20,
                max: 100,
                slide: function(event, ui) {

                    var slideClass = 'ui-slider',
                        indecatorClass = 'blue',
                        humanize = '';

                    // change color by value
                    if (ui.value > 85){
                        slideClass = 'ui-slider-green';
                        indecatorClass = 'green';
                        humanize = '（マスタ）';
                    } else if (ui.value > 70) {
                        slideClass = 'ui-slider';
                        indecatorClass = 'blue';
                        humanize = '（シニア）';
                    } else if (ui.value > 50) {
                        slideClass = 'ui-slider-orange';
                        indecatorClass = 'orange';
                        humanize = '（ジュニア）';
                    } else if (ui.value > 30) {
                        slideClass = 'ui-slider-red';
                        indecatorClass = 'red';
                        humanize = '（経験あり）';
                    } else {
                        slideClass = 'ui-slider-purple';
                        indecatorClass = 'purple';
                        humanize = '（知識あり）';
                    }

                    self.ui.slider
                        .removeClass('ui-slider-green ui-slider-orange ui-slider-red ui-slider-purple')
                        .addClass(slideClass);

                    self.ui.valIndicator
                        .removeClass('green orange blue red purple')
                        .addClass(indecatorClass);

                    self.ui.valIndicator.empty().text(ui.value + 'pt' + humanize);
                },
                stop: function(event, ui) {

                    // self.model.set('weight', ui.value);
                    self.weight = ui.value;
                    self.trigger('slider');

                    var progressClass = 'progress-bar-purple';

                    // change color by value
                    if (ui.value > 85){
                        progressClass = 'progress-bar-success';
                    } else if (ui.value > 70) {
                        progressClass = 'progress-bar';
                    } else if (ui.value > 50) {
                        progressClass = 'progress-bar-warning';
                    } else if (ui.value > 30) {
                        progressClass = 'progress-bar-danger';
                    }

                    self.ui.progress
                        .removeClass('progress-bar-success progress-bar-warning progress-bar-danger progress-bar-purple')
                        .addClass(progressClass)
                        .css('width', ui.value + '%')
                        .find('.pull-right').empty().text(ui.value + 'pt');
                }
            });

            // bind validator
            Backbone.Validation.bind(this);
        },

        // update model
        updateModel: function() {

            // clear all errors
            this.clearError();

            // get input data
            var inputData = {
                skill: this.ui.input.val(),
                weight: this.weight
            };

            // check input value
            var errors = this.model.preValidate(inputData) || {};

            // if input has no errors
            if (_.isEmpty(errors)) {
                // set value on model
                this.model.set(inputData);
                // render view with new value
                this.$el.find('.pull-left').empty().html('<i class="ace-icon fa fa-gear sl-icon"></i>&nbsp;' + inputData.skill);
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

        // on typeahead get selected
        ttUpdateModel: function() {
            // get selected value
            var ttValue = this.ui.input.typeahead('val');
            // set selected value on input
            this.ui.input.val(ttValue);
            // fire change event on input (so model will get updated)
            this.ui.input.trigger('change');
        }
    });
});