define([
    'text!admin/template/data/skill/item.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        className: 'isotope-item col-xs-12 col-sm-6 col-lg-4',

        events: {
            'click .widget-body': 'getWikis'
        },

        // initializer
        initialize: function() {
        },

        onRender: function() {
        },

        getWikis: function() {

            var self = this;
            $.ajax({
                type: 'GET',
                url: 'http://api.stackexchange.com/2.1/tags/' + encodeURIComponent(self.model.get('name')) + '/wikis',
                data: {
                    site: 'stackoverflow'
                },
                // use json format
                dataType: 'jsonp',

                jsonp: 'jsonp',
                success: function(data) {
                    self.model.set('wikis', data.items[0].excerpt);
                    self.render();
                },
                error: function() {
                    console.log('suck');
                }
            });

        },

        updateModel: function() {

            var skill = this.ui.input.val();

            this.model.set('skill', skill);
            if (skill)
                this.$el.find('.pull-left').empty().text(skill);
        },

        removeModel: function() {

            var self = this;

            this.$el.slBounceOut('', function(){
                $(this).removeClass('animated bounceOut');
                self.model.collection.remove(self.model);
            });
        }

    });

});