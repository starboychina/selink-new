define([
    'text!common/template/people/friends.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/view/people/item',
], function(
    template,
    BaseView,
    BaseCollection,
    ItemView
) {

    var PeopleCollection = BaseCollection.extend({

        url: '/connections/friends'
    });

    return BaseView.extend({

        // template
        template: template,

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            // create people collection
            this.collection = new PeopleCollection();
        },

        // After show
        onShow: function() {

            var self = this;

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#friends_page_nav',
                nextSelector : '#friends_page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>友達を読込み中・・・</em>',
                    finishedMsg: '友達は全部読込みました',
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

            // call super onShow
            BaseView.prototype.onShow.apply(this);
        }

    });

});