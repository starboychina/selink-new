define([
    'common/view/item-base',
    'text!common/template/profile/address.html'
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
                'zipCodeArea': '#zipCodeArea',
                'zipCode': '#zipCode',
                'address': '#address'
            });

            this.events = _.extend({}, this.events, {
                'keyup #zipCode': 'getAddress',
                'change #zipCode': 'updateModel',
                'change #address': 'updateModel'
            });

            // listen on address and zipcode property for save
            this.modelEvents = {
                'change:zipCode': 'save',
                'change:address': 'save'
            };
        },

        // after render
        onRender: function() {
            // enable mask input
            this.ui.zipCode.mask('999-9999');
        },

        // query address by zipcode
        getAddress: function() {

            var self = this;

            if (this.ui.zipCode.val().indexOf("_") >= 0)
                return;

            $.ajax({

                // page url
                url: '/address/' + self.ui.zipCode.val().replace("-", ""),

                // method is get
                type: 'GET',

                // use json format
                dataType: 'json',

                // wait for 3 seconds
                timeout: 3000,

                // spin an icon
                beforeSend: function() {
                    self.ui.zipCodeArea.find('.input-group-addon')
                        .empty().append('<i class="ace-icon fa fa-refresh fa-spin"><i>');
                },

                // success handler
                success: function(data) {
                    self.ui.address.val(data.state + " " + data.city + " " + data.street);
                    self.ui.address.trigger("change");
                },

                // remove spin icon
                complete: function() {
                    self.ui.zipCodeArea.find('.input-group-addon').empty().append("〒");
                }
            });
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
            return {
                zipCode: this.ui.zipCode.val(),
                address: this.ui.address.val()
            };
        },

        // render value by user input data
        renderValue: function(data) {
            // if user input is nothing
            if (!data.zipCode && !data.address) {
                // draw placehodler
                this.ui.value.html(this.placeholder);
                return;
            }
            // or draw the new value
            if (data.zipCode)
                this.ui.value.text("（〒 " + data.zipCode + "）" + data.address);
            else
                this.ui.value.text(data.address);
        }

    });
});