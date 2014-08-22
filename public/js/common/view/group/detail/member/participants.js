define([
    'text!common/template/group/detail/member/participants.html',
    'common/collection/base',
    'common/view/group/detail/member/item'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var ParticipantsCollection = BaseCollection.extend({

        url: function() {
            return '/groups/' + this.document.id + '/connections/participants';
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // this view is a modal dialog
        className: "modal-dialog",

        // template
        template: template,

        // child view container
        childViewContainer: '.ace-thumbnails',

        // child view
        childView: ItemView,

        events: {
            'click .btn-expel': 'onExpel'
        },

        // child events
        childEvents: {
            'clicked': 'onItemClick'
        },

        // initializer
        initialize: function() {

            // selected friend will saved here temprary
            this.selectMember = [];
            // selected friend view's $el will save here
            this.selectView = [];

            this.collection = new ParticipantsCollection(null, {document: this.model});
        },

        attachHtml: function(collectionView, itemView, index) {

            var self = this;

            // filter out current user
            if (itemView.model.id == selink.user.id)
                return;

            // ensure the image are loaded
            itemView.$el.imagesLoaded(function() {
                // prepend new item and reIsotope
                self.$el.find(self.childViewContainer).isotope('insert', itemView.$el);
            });
        },

        // after show
        onShow: function() {

            var self = this;

            // here we need a time-out call, cause this view is in a modal
            // and the modal will take a piece of time to be visible.
            // isotope only process the visible elements, if we isotope on it immediatly
            // isotope will not work. so I wait 0.5s here (niceScroll also)
            setTimeout(function() {

                // enable isotope
                self.$el.find(self.childViewContainer).isotope({
                    itemSelector : '.thumbnail-item'
                });

                // make container scrollable
                self.$el.find('.widget-main').niceScroll({
                    horizrailenabled: false
                });

                self.collection.fetch();

            }, 500);
        },

        onItemClick: function(view) {

            if (_.indexOf(this.selectMember, view.model.id) < 0) {
                this.selectMember.push(view.model.id);
                this.selectView.push(view.$el);
            } else {
                this.selectMember = _.without(this.selectMember, view.model.id);
                this.selectView = _.without(this.selectView, view.$el);
            }

            if (this.selectMember.length)
                this.$el.find('.btn-expel').removeClass('disabled');
            else
                this.$el.find('.btn-expel').addClass('disabled');
        },

        onExpel: function() {

            var self = this;

            this.model.save({
                expeled: this.selectMember
            }, {
                url: this.model.url() + '/expel',
                success: function() {

                    self.$el.find('.btn-expel').addClass('disabled');

                    _.each(self.selectView, function(view) {
                        self.$el.find(self.childViewContainer).isotope('remove', view).isotope('layout');
                    });

                    self.selectMember = [];
                    self.selectView = [];
                },
                patch: true,
                wait: true
            });
        }

    });
});