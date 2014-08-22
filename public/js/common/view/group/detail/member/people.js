define([
    'text!common/template/group/detail/member/people.html',
    'common/collection/base',
    'common/view/group/detail/member/item'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var Introductions = BaseCollection.extend({

        url: '/connections/nonfriends'
    });

    return Backbone.Marionette.CompositeView.extend({

        // class name
        className: "widget-box widget-color-orange",

        // template
        template: template,

        // child view container
        childViewContainer: '.widget-main',

        // child view
        childView: ItemView,

        events: {
            'click .btn-invite': 'onInvite'
        },

        // child events
        childEvents: {
            'clicked': 'onItemClick'
        },

        // initailizer
        initialize: function() {

            // selected friend will saved here temprary
            this.selectFriends = [];
            // selected friend view's $el will save here
            this.selectView = [];

            // create people collection
            this.collection = new Introductions();

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

                // attach infinite scroll
                self.$el.find(self.childViewContainer).infinitescroll({
                    navSelector  : '#people_page_nav',
                    nextSelector : '#people_page_nav a',
                    behavior: 'local',
                    binder: self.$el.find(self.childViewContainer),
                    dataType: 'json',
                    appendCallback: false,
                    loading: {
                        msgText: '<em>ユーザを読込み中・・・</em>',
                        finishedMsg: 'ユーザ情報は全部読込みました',
                    },
                    path: function() {
                        return '/connections/nonfriends?before=' + moment(self.collection.last().get('createDate')).unix();
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

            // setTimeout(function() {

            //     self.$el.find(self.childViewContainer).niceScroll({
            //         horizrailenabled: false,
            //     });
            // }, 1200);

        },

        onItemClick: function(view) {

            if (_.indexOf(this.selectFriends, view.model.id) < 0) {
                this.selectFriends.push(view.model.id);
                this.selectView.push(view.$el);
            } else {
                this.selectFriends = _.without(this.selectFriends, view.model.id);
                this.selectView = _.without(this.selectView, view.$el);
            }

            if (this.selectFriends.length)
                this.$el.find('.btn-invite').removeClass('disabled');
            else
                this.$el.find('.btn-invite').addClass('disabled');
        },

        onInvite: function() {

            var self = this;

            this.model.save({
                invited: this.selectFriends
            }, {
                url: this.model.url() + '/invite',
                success: function() {

                    self.$el.find('.btn-invite').addClass('disabled');

                    _.each(self.selectView, function(view) {
                        self.$el.find(self.childViewContainer).isotope('remove', view).isotope('layout');
                    });

                    self.selectFriends = [];
                    self.selectView = [];
                },
                patch: true,
                wait: true
            });
        }

    });
});