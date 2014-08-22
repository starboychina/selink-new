define([
    'text!common/template/post/main.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/model/post',
    'common/view/post/item',
    'common/view/post/new'
], function(
    template,
    BaseView,
    BaseCollection,
    PostModel,
    ItemView,
    NewPostView
) {

    // Posts collection
    var PostsCollection = BaseCollection.extend({

        model: PostModel,

        url: function() {
            return '/posts';
        }
    });

    return BaseView.extend({

        // template
        template: template,

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            // create posts collection
            this.collection = new PostsCollection(null, {document: selink.user});

            // create region manager (this composite view will have layout ability)
            this.rm = new Backbone.Marionette.RegionManager();

            // create regions
            this.regions = this.rm.addRegions({
                newPostRegion: '#new-post',
            });

            // create group drop-down list view
            this.newPostView = new NewPostView({targetCollection: this.collection});
        },

        // After show
        onShow: function() {

            var self = this;

            // display group drop-down list
            this.regions.newPostRegion.show(this.newPostView);

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#page_nav',
                nextSelector : '#page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>投稿を読込み中・・・</em>',
                    finishedMsg: '投稿は全部読込みました',
                },
                path: function() {
                    return '/posts?before=' + moment(self.collection.last().get('createDate')).unix();
                }
            }, function(json, opts) {

                // if there are more data
                if (json.length > 0)
                    // add data to collection, don't forget parse the json object
                    // this will trigger 'add' event and will call on
                    self.collection.add(json, {parse: true});
            });

            // call super onShow
            BaseView.prototype.onShow.apply(this);
        },

        // before destroy
        onBeforeDestroy: function() {
            // destroy region manager
            this.rm.destroy();
            // call super onBeforeDestroy
            BaseView.prototype.onBeforeDestroy.apply(this);
        }

    });
});