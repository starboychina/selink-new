define([
    'text!common/template/topnav/notification/item/friend.html',
    'text!common/template/topnav/notification/item/post.html',
    'text!common/template/topnav/notification/item/job.html',
    'text!common/template/topnav/notification/item/group.html',
], function(
    friendTemplate,
    postTemplate,
    jobTemplate,
    groupTemplate
) {

    return Backbone.Marionette.ItemView.extend({

        // notification type regard friend relation
        userTargetNotification: [
            'friend-invited', 
            'friend-approved', 
            'friend-declined', 
            'friend-break'],

        // notification type regard post action
        postTargetNotification: [
            'post-new', 
            'post-liked', 
            'post-bookmarked', 
            'post-commented',
            'comment-replied',
            'comment-liked'],

        // notification type regard job action
        jobTargetNotification: [
            'job-new', 
            'job-bookmarked'],

        // notification type regard group relation
        groupTargetNotification: [
            'group-new', 
            'group-invited', 
            'group-expeled', 
            'group-joined', 
            'group-refused', 
            'group-applied', 
            'group-approved', 
            'group-declined'],

        tagName: 'li',

        events: {
            'click .btn-approve': 'onApproveClick',
            'click .btn-decline': 'onDeclineClick',
            'click .btn-join': 'onJoinClick',
            'click .btn-refuse': 'onRefuseClick',
            'click .btn-acknowledge': 'onAcknowledgeClick',
        },

        // template
        getTemplate: function(){

            var type = this.model.get("type");

            if (_.indexOf(this.userTargetNotification, type) >= 0)
                return friendTemplate;
            else if (_.indexOf(this.postTargetNotification, type) >= 0)
                return postTemplate;
            else if (_.indexOf(this.jobTargetNotification, type) >= 0)
                return jobTemplate;
            else if (_.indexOf(this.groupTargetNotification, type) >= 0)
                return groupTemplate;
        },

        // approve friend request
        onApproveClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this;

            this.model.save({result: 'approved'}, {
                success: function(model, response, options) {
                    self.$el.slideUp(function() {
                        // add _from to current user's friends list
                        selink.user.get('friends').push(response._from);
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        },

        // decline friend request
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

        // accept group invitation
        onJoinClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this;

            this.model.save({result: 'accepted'}, {
                success: function(model, response, options) {
                    self.$el.slideUp(function() {
                        // add targetGroup to current user's group list
                        selink.user.get('groups').push(response.targetGroup);
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        },

        // refuse group invitation
        onRefuseClick: function(e) {

            // stop trigger the link on item
            e.preventDefault();

            var self = this;

            this.model.save({result: 'refused'}, {
                success: function() {
                    self.$el.slideUp(function() {
                        self.model.collection.remove(self.model);
                    });
                },
                patch: true
            });
        },

        // acknowledge a simple notification
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