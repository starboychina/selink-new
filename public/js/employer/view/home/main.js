define([
    'text!employer/template/home/main.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/model/base',
    'common/model/job',
    'common/model/post',
    'common/model/group',
    'common/view/post/item',
    'common/view/announcement/item',
    'common/view/job/item',
    'common/view/group/item',
    'common/view/post/create'
], function(
    template,
    BaseView,
    BaseCollection,
    BaseModel,
    JobModel,
    PostModel,
    GroupModel,
    PostItemView,
    AnnouncementItemView,
    JobItemView,
    GroupItemView,
    PostCreateView
) {

    var NewsFeedCollection = BaseCollection.extend({

        url: '/newsfeed',

        model: function(attrs, options) {

            if (_.has(attrs, 'cover'))
                return new GroupModel(attrs, options);
            else if (_.has(attrs, 'name'))
                return new JobModel(attrs, options);
            else if (_.has(attrs, 'title'))
                return new BaseModel(attrs, options);
            else
                return new PostModel(attrs, options);
        },

        comparator: function(item) {
            // sort by createDate
            var date = moment(item.get('createDate'));
            return 0 - Number(date.valueOf());
        }
    });

    return BaseView.extend({

        // Template
        template: template,

        // child view
        getChildView: function(item) {

            if (item.has('cover'))
                return GroupItemView;
            else if (item.has('name'))
                return JobItemView;
            else if (item.has('title'))
                return AnnouncementItemView;
            else
                return PostItemView;
        },

        events: {
            'click .btn-load': 'loadNewPosts'
        },

        // Initializer
        initialize: function() {

            var self = this;

            this.collection = new NewsFeedCollection();

            // this collection holds the posts delivered in real time
            this.realtimePost = new BaseCollection();

            // create region manager (this composite view will have layout ability)
            this.rm = new Backbone.Marionette.RegionManager();

            // create regions
            this.regions = this.rm.addRegions({
                createPostRegion: '#create-post',
            });

            // create new post view
            this.postCreateView = new PostCreateView();

            // if new post delivered
            selink.socket.on('post-new', function(data) {

                // assemble the new post
                data.targetPost._owner = data._from;
                data.targetPost.group = data.targetGroup;

                // save the post in collection
                self.realtimePost.add(data.targetPost);
                // update the number on indicator
                self.$el.find('.indicator-num').empty().text(self.realtimePost.length);
                // show the indicator to inform user
                self.$el.find('.news-indicator').slideDown();
            });
        },

        // After show
        onShow: function() {

            var self = this;

            // display new post view
            this.regions.createPostRegion.show(this.postCreateView);

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#page_nav',
                nextSelector : '#page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>読込み中・・・</em>',
                    finishedMsg: '全部読込みました',
                },
                path: function() {
                    return '/newsfeed?before=' + moment(self.collection.last().get('createDate')).unix();
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
        },

        // load the new posts
        loadNewPosts: function() {

            var self = this;

            // scroll to the top of page
            $('html, body').animate({ scrollTop: 0 }, 1000);

            // hide the indicator
            this.$el.find('.news-indicator').slideUp(function() {
                // move the new posts to the real colleciton of the page
                self.collection.add(self.realtimePost.models);
                // clear the real time post collection
                self.realtimePost.reset();
            });
        }

    });
});