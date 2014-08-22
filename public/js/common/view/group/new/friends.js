define([
    'text!common/template/group/new/friends.html',
    'common/collection/base',
    'common/view/group/new/item'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var FriendsCollection = BaseCollection.extend({

        url: '/connections/friends'
    });

    return Backbone.Marionette.CompositeView.extend({

        // class name
        className: "widget-box transparent",

        // template
        template: template,

        // child view container
        childViewContainer: '.widget-main',

        // child view
        childView: ItemView,

        events: {
            'click .btn-add-all': 'onAddAll'
        },

        // child events
        childEvents: {
            'clicked': 'onItemClick'
        },

        // initailizer
        initialize: function() {

            // create friends collection
            this.collection = new FriendsCollection();
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

                self.$el.find(self.childViewContainer).isotope({
                    itemSelector : '.thumbnail-item'
                });

                // attach infinite scroll
                self.$el.find(self.childViewContainer).infinitescroll({
                    navSelector  : '#friends_page_nav',
                    nextSelector : '#friends_page_nav a',
                    behavior: 'local',
                    binder: self.$el.find(self.childViewContainer),
                    dataType: 'json',
                    appendCallback: false,
                    loading: {
                        msgText: '<em>ユーザを読込み中・・・</em>',
                        finishedMsg: 'ユーザ情報は全部読込みました',
                    },
                    path: function() {
                        return '/connections/friends?before=' + moment(self.collection.last().get('createDate')).unix();
                    }
                }, function(json, opts) {
                    // if there are more data
                    if (json.length > 0)
                        // add data to collection, don't forget parse the json object
                        // this will trigger 'add' event and will call on
                        self.collection.add(json, {parse: true});
                });

                self.collection.fetch();

            }, 500);
        },

        // add all friend
        onAddAll: function(e) {

            e.preventDefault();

            this.children.each(function(view) {
                view.onClick();
            });
        },

        onItemClick: function(view) {

            var invited = this.model.get('invited');

            if (_.findWhere(invited, {id: view.model.id}))
                this.model.set('invited', _.without(invited, view.model));
            else
                invited.push(view.model);
        }

    });
});