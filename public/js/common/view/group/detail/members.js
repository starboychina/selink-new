define([
    'text!common/template/group/detail/members.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/view/group/detail/member',
    'common/view/group/detail/member/invite'
], function(
    template,
    BaseView,
    BaseCollection,
    ItemView,
    InviteView
) {

    var MembersCollection = BaseCollection.extend({

        url: function() {
            return '/groups/' + this.document.id + '/connections/participants';
        }
    });

    return BaseView.extend({

        // class name
        className: "widget-box transparent",

        // template
        template: template,

        // child view container
        childViewContainer: '.widget-main',

        // child view
        childView: ItemView,

        // child selector
        childSelector: '.thumbnail-item',

        // events
        events: {
            'click .btn-invite': 'showInviteView',
        },

        modelEvents: {
            'change:participants': 'renderParticipants'
        },

        // initializer
        initialize: function() {

            this.collection = new MembersCollection(null, {document: this.model});
        },

        // after render
        onRender: function() {

            // add tooltip on add button
            this.$el.find('.btn-invite').tooltip({
                placement: 'top',
                title: "メンバー招待",
                container: 'body',
                template: '<div class="tooltip tooltip-success"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
            });
        },

        // edit group member
        showInviteView: function() {

            // create member edit dialog with this view's model
            var inviteView = new InviteView({
                model: this.model
            });

            // show edit dialog
            selink.modalArea.show(inviteView);
            selink.modalArea.$el.modal('show');
        },

        renderParticipants: function() {

            var self = this;

            this.collection.fetch({
                success: function() {
                    self.ensureLayout();
                }
            });
        }

    });
});