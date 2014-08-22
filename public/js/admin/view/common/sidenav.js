define(['text!admin/template/common/sidenav.html',], function(template) {

    return Backbone.Marionette.ItemView.extend({

        template: template,

        events: {
            'click li': 'activeMenu',
            'mouseover li': 'attention'
        },

        onShow: function() {
            // this.$el.addClass('animated fadeInLeft');
            // ace.handle_side_menu($);
        },

        activeMenu: function(event) {
            this.$el.find('li').removeClass('active');
            $(event.target).closest('li').addClass('active');
            $(event.target).closest('ul').closest('li').addClass('active open');
        },

        attention: function(event) {
            $(event.target).find('i').slWobble();
        }
    });
});