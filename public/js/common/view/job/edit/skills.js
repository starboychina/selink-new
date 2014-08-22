define([
    'common/view/job/composite-base',
    'common/view/job/collection/skills',
    'text!common/template/profile/skills.html',
    'common/view/job/edit/skill'
], function(
    BaseView,
    Skills,
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

        itemName: 'skills',

        // child view
        childView: ItemView,

        // max item number
        itemLimit: 8,

        // initializer
        initialize: function() {
            // make the collection from user model
            this.collection = new Skills(this.model.get('skills'))
        },

        // on render
        onRender: function() {

            // add tooltip on add button
            this.$el.find('.btn-add').tooltip({
                placement: 'top',
                title: "スキルを追加"
            });

            // if the collection exceed the limit number
            if (this.collection.length >= this.itemLimit)
                // hide add button
                this.ui.addBtn.hide();
        }

    });
});