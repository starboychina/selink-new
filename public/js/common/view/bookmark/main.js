define([
    'text!common/template/bookmark/main.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/model/base',
    'common/model/job',
    'common/model/post',
    'common/view/post/item',
    'common/view/job/item'
], function(
    template,
    BaseView,
    BaseCollection,
    BaseModel,
    JobModel,
    PostModel,
    PostItemView,
    JobItemView
) {

    var BookMarkCollection = BaseCollection.extend({

        url: '/bookmark',

        model: function(attrs, options) {

            if (_.has(attrs, 'name'))
                return new JobModel(attrs, options);
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

            if (item.has('name'))
                return JobItemView;
            else
                return PostItemView;
        },

        // Initializer
        initialize: function() {

            this.collection = new BookMarkCollection();

            // call super initializer
            BaseView.prototype.initialize.apply(this);
        }

    });
});