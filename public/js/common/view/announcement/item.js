define([
    'text!common/template/announcement/item.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // class name
        className: 'isotope-item col-xs-12 col-sm-6 col-lg-8',

        // template
        template: template

    });
});
