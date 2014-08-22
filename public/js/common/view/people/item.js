define([
    'text!common/template/people/item.html'
],function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        // class name
        className: 'isotope-item col-xs-12 col-sm-6 col-lg-4',

        // events
        events: {
            'click .btn-friend': 'onAddFriend'
        },

        // add this person as friends
        onAddFriend: function() {

            var self = this;

            // disable the button, user can't push it twice
            this.$el.find('.btn-friend').button('loading');

            // create a friend in invited list
            selink.user.save({
                id: this.model.get('_id')
            }, {
                url: '/connections/invite',
                success: function() {
                    // change the label of the add button, but still disabled
                    self.$el.find('.btn-friend')
                        .removeClass('btn-info btn-friend')
                        .addClass('btn-success')
                        .empty()
                        .html('<i class="ace-icon fa fa-check light-green"></i>&nbsp;友達リクエスト送信済み');
                },
                patch: true,
                wait: true
            });
        }

    });
});