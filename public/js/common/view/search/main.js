define([
    'text!common/template/search/main.html',
    'common/view/composite-isotope',
    'common/model/job',
    'common/model/user',
    'common/model/post',
    'common/model/group',
    'common/view/search/empty',
    'common/view/post/item',
    'common/view/people/item',
    'common/view/job/item',
    'common/view/group/item'
], function(
    template,
    BaseView,
    JobModel,
    UserModel,
    PostModel,
    GroupModel,
    EmptyView,
    PostItemView,
    PeopleItemView,
    JobItemView,
    GroupItemView
) {

    var SearchCollection = Backbone.Collection.extend({

        initialize: function(models, options) {
            if (options && options.term)
                this.term = options.term;
        },

        url: function() {
            return '/search?term=' + this.term;
        },

        model: function(attrs, options) {

            var model;

            if (attrs.type === 'Job')
                model = new JobModel({_id: attrs.id});
            else if (attrs.type === 'User')
                model = new UserModel({_id: attrs.id});
            else if (attrs.type === 'Post')
                model = new PostModel({_id: attrs.id});
            else if (attrs.type === 'Group')
                model = new GroupModel({_id: attrs.id});

            return model;
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

        // empty view
        emptyView: EmptyView,

        // child view
        getChildView: function(item) {

            if (item.has('description'))
                return GroupItemView;
            else if (item.has('name'))
                return JobItemView;
            else if (item.has('firstName'))
                return PeopleItemView;
            else
                return PostItemView;
        },

        // Initializer
        initialize: function() {
            // this collection used as buffer
            this.searchCollection = new SearchCollection(null, {term: this.model.get('term')});
            // this is the real collection for this page
            this.collection = new Backbone.Collection();
        },

        // After show
        onShow: function() {

            /*
                onShow are fully overrided, cause we need a different way to populate collecion.
            */
            var self = this;

            // enable isotope
            this.$el.find(this.childViewContainer).isotope({
                itemSelector : '.isotope-item',
                stamp: '.stamp',
                masonry: {
                    columnWidth: '.isotope-item'
                }
            });

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : this.navSelector || '#page_nav',
                nextSelector : this.nextSelector || '#page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>読込み中・・・</em>',
                    finishedMsg: 'No more pages to load.',
                    img: 'http://i.imgur.com/qkKy8.gif',
                    speed: 'slow',
                },
                state: {
                    currPage: 0
                },
                // the default determine path fuction is not fit selink,
                // here just use the specific one. (from infinitescroll.js line 283)
                pathParse: function(path) {
                    if (path.match(/^(.*?page=)1(\/.*|$)/)) {
                        path = path.match(/^(.*?page=)1(\/.*|$)/).slice(1);
                        return path;
                    }
                }
            }, function(json, opts) {
                // no more data
                if (json.length === 0){
                    // destroy infinite scroll, or it will affect other page
                    self.$el.find(self.childViewContainer).infinitescroll('destroy');
                    self.$el.find(self.childViewContainer).data('infinitescroll', null);
                } else {

                    // replace the buffer collection with the new data
                    self.searchCollection.reset(json);

                    // for each model of the buffer collection (we already know the type of model here)
                    self.searchCollection.each(function(model){
                        // fetch the model
                        model.fetch({
                            success: function(model, response, options) {
                                // add model to real collection to display
                                self.collection.add(model);
                            }
                        });
                    });
                }
            });

            // use another way to populate collection, this is **not** good for performace!! need to find a better way!
            // fetch the buffer collection, server will return the result like {type, id, score}
            // the buffer collection will create model by "type", and paste id on it.
            this.searchCollection.fetch({

                success: function(collection, response, options) {

                    // for each model of the buffer collection (we already know the type of model here)
                    collection.each(function(model){

                        // fetch the model
                        model.fetch({
                            success: function(model, response, options) {
                                // add model to real collection to display
                                self.collection.add(model);
                            }
                        });
                    });
                }
            });
        },

        // re-isotope after collection get synced
        onSync: function(model_or_collection, resp, options) {

            var self = this;

            // use imageLoaded plugin
            this.$el.find(this.childViewContainer).imagesLoaded(function() {
                // re-isotope
                self.$el.find(self.childViewContainer).isotope('layout');
            });
        },

    });
});