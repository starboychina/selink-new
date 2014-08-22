define([
    'text!common/template/group/main.html',
    'common/view/group/discover',
    'common/view/group/joined',
    'common/view/group/mine',
    'common/view/group/new',
    'common/model/group'
], function(
    template,
    DiscoverView,
    JoinedView,
    MineView,
    NewView,
    GroupModel
) {

    return Backbone.Marionette.LayoutView.extend({

        // Template
        template: template,

        // events
        events: {
            'click .btn-discover': 'showDiscoverView',
            'click .btn-joined': 'showJoinedView',
            'click .btn-mine': 'showMineView',
            'click .btn-new': 'showNewView'
        },

        // regions
        regions: {
            displayRegion: '#display'
        },

        // after show
        onShow: function() {

            if (this.options.type == 'joined')
                this.showJoinedView();
            else if (this.options.type == 'mine')
                this.showMineView();
            else
                this.showDiscoverView();
        },

        showDiscoverView: function() {
            // lazy load group discover view
            this.discoverView = new DiscoverView();
            this.displayRegion.show(this.discoverView);
            selink.router.navigate('#group/discover');
        },

        showJoinedView: function() {
            // lazy load joined group view
            this.joinedView = new JoinedView();
            this.displayRegion.show(this.joinedView);
            selink.router.navigate('#group/joined');
        },

        showMineView: function() {
            // lazy load mine group view
            this.mineView = new MineView();
            this.displayRegion.show(this.mineView);
            selink.router.navigate('#group/mine');
        },

        showNewView: function() {

            this.newView = new NewView({model: new GroupModel({
                type: 'public',
                invited: []
            })});

            selink.modalArea.show(this.newView);
            selink.modalArea.$el.modal('show');
        }
    });
});