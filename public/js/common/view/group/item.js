define([
    'text!common/template/group/item.html'
],function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // class name
        className: 'isotope-item col-xs-12 col-md-6 col-lg-4',

        // events
        events: {
            'click .btn-join': 'onJoin',
            'click .btn-apply': 'onApply'
        },

        // after render
        onRender: function() {

            this.$el.find('.tooltip-success').tooltip({
                placement: 'top',
                title: this.model.get('participants').length + "人参加中"
            });

            // add tooltip on add button
            this.$el.find('.tooltip-warning').tooltip({
                placement: 'top',
                title: "イベント" + this.model.get('events').length + "件"
            });

            this.$el.find('.tooltip-info').tooltip({
                placement: 'top',
                title: "投稿" + this.model.get('posts').length + "件"
            });
        },

        // join group
        onJoin: function() {

            var self = this;

            // show loading icon, and prevent user click twice
            this.$el.find('.btn-join').button('loading');

            // create a participant in this group
            this.model.save(null, {
                url: 'groups/' + this.model.id + '/join',
                success: function(model, response, options) {

                    var joinedLabel = $('<span class="text-success"><i class="ace-icon fa fa-check"></i>&nbsp;参加中</span>');

                    // change the add button to label
                    self.$el.find('.btn-join').fadeOut(function() {
                        self.$el.find('.group-info').prepend(joinedLabel);
                        self.trigger('ensureLayout');
                    });

                    // sycn with user model
                    selink.user.get('groups').push(self.model.id);
                },
                patch: true,
                wait: true
            });
        },

        // apply to join group
        onApply: function() {

            var self = this;

            // show loading icon, and prevent user click twice
            this.$el.find('.btn-apply').button('loading');

            // create a participant in this group
            this.model.save(null, {
                url: 'groups/' + this.model.id + '/apply',
                success: function(model, response, options) {

                    var joinedLabel = $('<span class="text-success"><i class="ace-icon fa fa-check"></i>&nbsp;参加申請中</span>');

                    // change the add button to label
                    self.$el.find('.btn-apply').fadeOut(function() {
                        self.$el.find('.group-info').prepend(joinedLabel);
                        self.trigger('ensureLayout');
                    });

                    // sycn with user model
                    selink.user.get('applying').push(self.model.id);
                },
                patch: true,
                wait: true
            });
        }

    });
});