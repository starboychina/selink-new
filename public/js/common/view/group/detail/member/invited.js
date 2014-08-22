define([
    'text!common/template/group/detail/member/invited.html',
    'common/collection/base',
    'common/view/group/detail/member/item'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var InvitedCollection = BaseCollection.extend({

        url: function() {
            return '/groups/' + this.document.id + '/connections/invited';
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

        // initializer
        initialize: function() {

            this.collection = new InvitedCollection(null, {document: this.model});
        },

        attachHtml: function(collectionView, itemView, index) {

            var self = this;
            
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
        }

    });
});