define([
    'text!common/template/people/detail/groups.html',
    'common/collection/base',
    'common/view/people/detail/group'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var GroupsCollection = BaseCollection.extend({

        url: function() {
            return '/users/' + this.document.id + '/groups?size=3';
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // child view container
        childViewContainer: '#group-list',

        // child view
        childView: ItemView,

        // initializer
        initialize: function() {

            this.collection = new GroupsCollection(null, {document: this.model});

            this.collection.fetch();

        }

    });
});