define([
    'text!common/template/job/item/matches.html',
    'common/view/job/empty-match',
    'common/view/job/item/match'
], function(
    template,
    emptyView,
    ItemView
) {

    return Backbone.Marionette.CollectionView.extend({

        // template
        template: template,

        className: 'row no-margin',

        // child view container
        childViewContainer: '.match-result',

        // child view
        childView: ItemView,

        emptyView: emptyView
    });
});