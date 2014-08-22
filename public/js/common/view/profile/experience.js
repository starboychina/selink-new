define([
    'common/view/item-base',
    'text!common/template/profile/experience.html'
], function(
    BaseView,
    template) {

    return BaseView.extend({

        // template
        template: template,

        // className
        className: 'row',

        // initializer
        initialize: function() {

            this.ui = _.extend({}, this.ui, {
                'input': 'input'
            });

            this.events = _.extend({}, this.events, {
                'change input': 'save'
            });
        },

        // after render
        onRender: function() {
            // enable mask input
            this.ui.input.mask('9?9');
        },

        // get user input data
        getData: function() {
            return {
                experience: Number(this.ui.input.val())
            };
        },

        // render value by user input data
        renderValue: function(data) {

            // if user input nothing
            if (!data.experience) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value
            this.ui.value.text(data.experience + "年");
        }

    });
});