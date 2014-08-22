define([
    'text!common/template/topnav/message/item.html',
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        tagName: 'li',

        events: {
            'click .btn-approve': 'onApproveClick',
            'click .btn-decline': 'onDeclineClick',
            'click .btn-acknowledge': 'onAcknowledgeClick',
        },

        // template
        template: template,

        onApproveClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this,
                // TODO: this is may not good, server will return the updated notification,
                // but only contain the "_from" as id, and it will be set back to model,
                // I want add _from to friends list, have to put it here temporary
                friend = this.model.get('_from');

            this.model.save({result: 'approved'}, {
                success: function() {
                    self.$el.slideUp(function() {
                        selink.user.friends.add(friend);
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        },

        onDeclineClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this;

            this.model.save({result: 'declined'}, {
                success: function() {
                    self.$el.slideUp(function() {
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        },

        onAcknowledgeClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this;

            this.model.save({result: 'acknowledged'}, {
                success: function() {
                    self.$el.slideUp(function() {
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        }
    });
});