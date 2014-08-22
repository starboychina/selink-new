define([
    'text!common/template/people/detail/friends.html',
    'common/collection/base',
    'common/view/people/detail/friend'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var FriendsCollection = BaseCollection.extend({

        url: function() {
            return '/users/' + this.document.id + '/connections?size=8';
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // child view container
        childViewContainer: '#friend-list',

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            this.collection = new FriendsCollection(null, {document: this.model});

            this.collection.fetch();
        }

    });
});