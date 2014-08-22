define([
    'text!common/template/activity/main.html',
    'common/collection/base',
    'common/view/activity/item-day'
], function(
    template,
    BaseCollection,
    ItemView) {

    var Activities = BaseCollection.extend({
        url: '/activities'
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // for dnd add class here
        className: 'widget-box transparent',

        // child view container
        childViewContainer: this.$el,

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            var self = this;

            this.collection = new Backbone.Collection();

            var rawData = new Activities();

            rawData.fetch({

                success: function(collection, response, options) {

                    self.collection.add(self._processRawData(response));
                }
            });
        },

        // After show
        onShow: function() {

            var self = this;

            // attach infinite scroll
            this.$el.infinitescroll({
                navSelector  : '#page_nav',
                nextSelector : '#page_nav a',
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
                }
            }, function(json, opts) {
                // no more data
                if (json.length === 0){
                    // destroy infinite scroll, or it will affect other page
                    self.$el.infinitescroll('destroy');
                    self.$el.data('infinitescroll', null);
                } else {

                    // add data to collection
                    // this will trigger 'add' event and will call on
                    // the attachHtml method that changed on initialization
                    self.collection.add(self._processRawData(json));
                }
            });
        },

        // before destroy
        onBeforeDestroy: function() {
            // destroy infinite scroll, or it will affect other page
            this.$el.infinitescroll('destroy');
            this.$el.data('infinitescroll', null);
        },

        _processRawData: function(rawData) {

            var groupData = _.groupBy(rawData, function(activity) {
                return moment(activity.createDate).format('YYYY/MM/DD');
            });

            var models = [];

            for(var date in groupData) {
                models.push({
                    date: date,
                    activities: groupData[date]
                });
            }

            return models;
        }

    });
});