define([
    'text!common/template/group/joined.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/view/group/item',
    'common/model/group'
], function(
    pageTemplate,
    BaseView,
    BaseCollection,
    ItemView,
    GroupModel
) {

    var GroupsCollection = BaseCollection.extend({

        url: '/groups/joined'
    });

    return BaseView.extend({

        // Template
        template: pageTemplate,

        // child view
        childView: ItemView,

        // Initializer
        initialize: function() {

            // create posts collection
            this.collection = new GroupsCollection();
        },

        // After show
        onShow: function() {

            var self = this;

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#joined_page_nav',
                nextSelector : '#joined_page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>グループを読込み中・・・</em>',
                    finishedMsg: 'グループは全部読込みました',
                },
                path: function() {
                    return '/groups/joined?before=' + moment(self.collection.last().get('createDate')).unix();
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
        }

    });
});