define([
    'text!common/template/activity/item/user-activated.html',
    'text!common/template/activity/item/user-login.html',
    'text!common/template/activity/item/post.html',
    'text!common/template/activity/item/friend.html',
    'text!common/template/activity/item/job.html',
    'text!common/template/activity/item/group.html',
    'text!common/template/people/popover.html',
    'text!common/template/group/popover.html',
    'common/model/base'
], function(
    userActivatedTemplate,
    userLoginTemplate,
    userPostTemplate,
    userFriendInvitedTemplate,
    userJobTemplate,
    groupTemplate,
    peoplePopoverTemplate,
    groupPopoverTemplate,
    BaseModel
) {

    return Backbone.Marionette.ItemView.extend({

        loginActivity: [
            'user-login',
            'user-logout'],

        userTargetActivity: [
            'friend-invited', 
            'friend-approved', 
            'friend-declined', 
            'friend-break'],

        postTargetActivity: [
            'post-new', 
            'post-liked', 
            'post-bookmarked', 
            'post-commented', 
            'comment-replied',
            'comment-liked'],

        jobTargetActivity: [
            'job-new', 
            'job-bookmarked'],

        groupTargetActivity: [
            'group-new', 
            'group-invited', 
            'group-joined', 
            'group-refused', 
            'group-applied', 
            'group-approved', 
            'group-declined',
            'group-event-new'],

        // template
        getTemplate: function(){

            var type = this.model.get("type");

            if (type == "user-activated")
                return userActivatedTemplate;
            else if (_.indexOf(this.loginActivity, type) >= 0)
                return userLoginTemplate;
            else if (_.indexOf(this.userTargetActivity, type) >= 0)
                return userFriendInvitedTemplate;
            else if (_.indexOf(this.postTargetActivity, type) >= 0)
                return userPostTemplate;
            else if (_.indexOf(this.jobTargetActivity, type) >= 0)
                return userJobTemplate;
            else if (_.indexOf(this.groupTargetActivity, type) >= 0)
                return groupTemplate;
        },

        className: 'timeline-item clearfix',

        events: {
            'click .timeline-info img': 'toProfile',
            'click .group-link': 'toGroup',
        },

        // after render
        onRender: function() {

            if (this.model.get('targetGroup'))
                // add popover on group link
                this.$el.find('.group-link').popover({
                    html: true,
                    trigger: 'hover',
                    container: 'body',
                    placement: 'auto right',
                    title: '<img src="' + this.model.get('targetGroup').cover + '" />',
                    content: _.template(groupPopoverTemplate, this.model.get('targetGroup')),
                });


            // add popover on photo
            this.$el.find('.timeline-info img').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.get('_owner').cover + '" />',
                content: _.template(peoplePopoverTemplate, this.model.get('_owner')),
            });
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on user's photo
            this.$el.find('.timeline-info img').popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.get('_owner')._id;
        },

        // turn to group page
        toGroup: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on group label
            this.$el.find('.group-link').popover('destroy');
            // turn the page manually
            window.location = '#group/' + this.model.get('targetGroup')._id;
        }

    });
});