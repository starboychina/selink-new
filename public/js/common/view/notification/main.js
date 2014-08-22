define([
    'text!common/template/notification/main.html',
    'common/collection/base',
    'common/view/notification/item'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var Notifications = BaseCollection.extend({

        url: '/notifications?embed=_from'
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // child view container
        childViewContainer: this.$el,

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {
            this.collection = new Notifications();
            this.collection.fetch();
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
                    finishedMsg: '通知は全部読込みました',
                },
                state: {
                    currPage: 0
                },
                path: function(pageNum) {
                    return '/notifications?embed=_from&after=' + moment(self.collection.last().get('createDate')).unix();
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
                    self.collection.add(json);
                }
            });
        },

        // before destroy
        onBeforeDestroy: function() {
            // destroy infinite scroll, or it will affect other page
            this.$el.infinitescroll('destroy');
            this.$el.data('infinitescroll', null);
        }

    });
});