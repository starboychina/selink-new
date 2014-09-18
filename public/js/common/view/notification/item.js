define([
    'text!common/template/notification/item/friend.html',
    'text!common/template/notification/item/post.html',
    'text!common/template/notification/item/job.html',
    'text!common/template/notification/item/group.html',
    'text!common/template/people/popover.html',
    'text!common/template/group/popover.html',
    'common/view/topnav/notification/item'
], function(
    friendTemplate,
    postTemplate,
    jobTemplate,
    groupTemplate,
    peoplePopoverTemplate,
    groupPopoverTemplate,
    BaseView
) {

    return BaseView.extend({

        tagName: 'div',

        ui: {
            avatar: '.avatar',
            groupLink: '.group-link',
        },

        events: {
            'click @ui.avatar': 'toProfile',
            'click @ui.groupLink': 'toGroup',

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

        onRender: function() {

            if (this.model.get('targetGroup'))
                // add popover on group link
                this.ui.groupLink.popover({
                    html: true,
                    trigger: 'hover',
                    container: 'body',
                    placement: 'auto top',
                    title: '<img src="' + this.model.get('targetGroup').cover_ref + '" />',
                    content: _.template(groupPopoverTemplate, this.model.get('targetGroup')),
                });

            // add popover on avatar
            this.ui.avatar.popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.get('_from').cover_ref + '" />',
                content: _.template(peoplePopoverTemplate, this.model.get('_from')),
            });
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on avatar
            this.ui.avatar.popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.get('_from')._id;
        },

        // turn to group page
        toGroup: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on group label
            this.ui.groupLink.popover('destroy');
            // turn the page manually
            window.location = '#group/' + this.model.get('targetGroup')._id;
        },

        onApproveClick: function() {

            var self = this,
                // TODO: this is may not good, server will return the updated notification,
                // but only contain the "_from" as id, and it will be set back to model,
                // I want add _from to friends list, have to put it here temporary
                friend = this.model.get('_from');

            this.model.save({result: 'approved'}, {
                url: '/notifications/' + this.model.get('_id'),
                success: function() {
                    selink.user.friends.add(friend);
                    self.$el.find('.pull-right').fadeOut(function() {
                        $(this).empty()
                            .html('<div class="text-muted pull-right"><i class="ace-icon fa fa-check"></i>&nbsp;承認済み</div>')
                            .fadeIn();
                    });
                    selink.user.notifications.remove(self.model.get('_id'));
                },
                patch: true
            });
        },

        onDeclineClick: function() {

            var self = this;

            this.model.save({result: 'declined'}, {
                url: '/notifications/' + this.model.get('_id'),
                success: function() {
                    self.$el.find('.pull-right').fadeOut(function() {
                        $(this).empty()
                            .html('<div class="text-muted pull-right"><i class="ace-icon fa fa-check"></i>&nbsp;拒否済み</div>')
                            .fadeIn();
                    });
                    selink.user.notifications.remove(self.model.get('_id'));
                },
                patch: true
            });
        },

        // accept group invitation
        onJoinClick: function() {

            var self = this;

            this.model.save({result: 'accepted'}, {
                url: '/notifications/' + this.model.get('_id'),
                success: function() {
                    self.$el.find('.pull-right').fadeOut(function() {
                        $(this).empty()
                            .html('<div class="text-muted pull-right"><i class="ace-icon fa fa-check"></i>&nbsp;参加済み</div>')
                            .fadeIn();
                    });
                    selink.user.notifications.remove(self.model.get('_id'));
                },
                patch: true
            });
        },

        // refuse group invitation
        onRefuseClick: function() {

            var self = this;

            this.model.save({result: 'refused'}, {
                url: '/notifications/' + this.model.get('_id'),
                success: function() {
                    self.$el.find('.pull-right').fadeOut(function() {
                        $(this).empty()
                            .html('<div class="text-muted pull-right"><i class="ace-icon fa fa-check"></i>&nbsp;拒否済み</div>')
                            .fadeIn();
                    });
                    selink.user.notifications.remove(self.model.get('_id'));
                },
                patch: true
            });
        },

        onAcknowledgeClick: function() {

            var self = this;

            this.model.save({result: 'acknowledged'}, {
                url: '/notifications/' + this.model.get('_id'),
                success: function() {
                    self.$el.find('.pull-right').fadeOut(function() {
                        $(this).empty()
                            .html('<div class="text-muted pull-right"><i class="ace-icon fa fa-check"></i>&nbsp;確認済み</div>')
                            .fadeIn();
                    });
                    selink.user.notifications.remove(self.model.get('_id'));
                },
                patch: true
            });
        }
    });
});