define([
    'text!common/template/mailbox/main.html',
    'common/view/mailbox/inbox',
    'common/view/mailbox/sentbox',
    'common/view/mailbox/edit'
], function(
    template,
    InBoxView,
    SentBoxView,
    MessageEditView
) {

    return Backbone.Marionette.LayoutView.extend({

        className: 'tabbable',

        // template
        template: template,

        // events
        events: {
            'click .btn-msg': 'showMessageEditor',
            'click a[href="#sentbox"]': 'showSentBox'
        },

        // regions
        regions: {
            inBoxRegion: '#inbox',
            sentBoxRegion: '#sentbox'
        },

        // after show
        onShow: function() {

            // create inbox view, don't do this in initialize method
            // cause the infinite scroll need the item container in the dom tree
            this.inBox = new InBoxView();
            // show inbox view on start
            this.inBoxRegion.show(this.inBox);

            this.$el.addClass('animated fadeInUp');
        },

        showSentBox: function() {
            // lazy load sent box
            if (!this.sentBox) {
                this.sentBox = new SentBoxView();
                this.sentBoxRegion.show(this.sentBox);
            }
        },

        showMessageEditor: function() {

            var messageEditor = new MessageEditView();

            selink.modalArea.show(messageEditor);
            selink.modalArea.$el.modal('show');
        },

    });
});