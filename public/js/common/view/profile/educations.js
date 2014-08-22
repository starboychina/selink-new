define([
    'common/view/composite-base',
    'text!common/template/profile/educations.html',
    'common/view/profile/education'
], function(
    BaseView,
    template,
    ItemView
) {

    return BaseView.extend({

        // template
        template: template,

        // className
        className: 'widget-box transparent',

        // child view container
        childViewContainer: '.widget-main',

        itemName: 'educations',

        // child view
        childView: ItemView,

        // max item number
        itemLimit: 4,

        // initializer
        initialize: function() {
            // make the collection from user model
            this.collection = this.model.educations;
        },

        // on render
        onRender: function() {

            // add tooltip on add button
            this.$el.find('.btn-add').tooltip({
                placement: 'top',
                title: "学歴を追加"
            });

            // if the collection exceed the limit number
            if (this.collection.length >= this.itemLimit)
                // hide add button
                this.ui.addBtn.hide();
        },

    });
});