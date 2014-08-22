define([
    'text!common/template/people/main.html',
    'common/view/people/discover',
    'common/view/people/friends',
    'common/view/people/invited',
], function(
    template,
    DiscoverView,
    FriendsView,
    InvitedView
) {

    return Backbone.Marionette.LayoutView.extend({

        // Template
        template: template,

        // events
        events: {
            'click .btn-friends': 'showFriendsView',
            'click .btn-invited': 'showInvitedView',
            'click .btn-discover': 'showDiscoverView'
        },

        // regions
        regions: {
            displayRegion: '#display'
        },

        // after show
        onShow: function() {

            if (this.options.type == 'friends')
                this.showFriendsView();
            else if (this.options.type == 'invited')
                this.showInvitedView();
            else
                this.showDiscoverView();
        },

        showDiscoverView: function() {
            // lazy load people discover view
            this.discoverView = new DiscoverView();
            this.displayRegion.show(this.discoverView);
            selink.router.navigate('#people/discover');
        },

        showFriendsView: function() {
            // lazy load friends view
            this.friendsView = new FriendsView();
            this.displayRegion.show(this.friendsView);
            selink.router.navigate('#people/friends');
        },

        showInvitedView: function() {
            // lazy load invited people view
            this.invitedView = new InvitedView();
            this.displayRegion.show(this.invitedView);
            selink.router.navigate('#people/invited');
        }
    });
});