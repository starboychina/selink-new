define([
    'common/view/composite-isotope',
    'text!admin/template/data/skill/main.html',
    'common/collection/base',
    'admin/view/data/skill/item'
], function(
    BaseView,
    template,
    BaseCollection,
    ItemView
) {

    var TagCollection = BaseCollection.extend({
        url: '/tags'
    });

    return BaseView.extend({

        // Template
        template: template,

        // child view
        childView: ItemView,

        // ui
        ui: {
            'stack': '#stack'
        },

        // Events
        events: {
            'click #stack': 'getStack'
        },

        count: 1,

        // Initializer
        initialize: function() {

            this.collectionEvents = _.extend({}, this.collectionEvents, {
                'change': 'updateTag'
            });

            this.collection = new TagCollection();

            // call super initializer
            BaseView.prototype.initialize.apply(this);
        },

        createTag: function(model) {

            var self = this;

            // safe the event
            this.collection.create(event, {

                // event saved successful
                success: function(model, response, options) {

                },
                // if error happend
                error: function(model, xhr, options) {

                }
            });
        },

        updateTag: function(model) {

            if (model.isNew()) return;

            var self = this;

            // Save the model
            model.save(null , {

                // if save success
                success: function(model, response, options) {

                },

                // if other errors happend
                error: function(model, xhr, options) {

                    var error = $.parseJSON(xhr.responseText);

                    $.gritter.add({
                        title: error.title,
                        text: error.msg,
                        sticky: true,
                        class_name: 'gritter-error gritter-center',
                    });
                },

                // use patch
                patch: true
            });
        },

        removeTag: function(model) {

            var self = this;

            model.destroy({
                success: function() {

                }
            });

        },

        getStack: function getStack() {
            var self = this;
            $.ajax({
                type: 'GET',
                url: 'http://api.stackexchange.com/2.1/tags',
                data: {
                    pagesize: 100,
                    page: self.count,
                    order: 'desc',
                    sort: 'popular',
                    site: 'stackoverflow'
                },
                // use json format
                dataType: 'jsonp',

                jsonp: 'jsonp',
                success: function(data) {
                    self.saveStack(data);
                    if (data.has_more) {
                        self.count++;
                        console.log(self.count);
                        setTimeout(self.getStack(), 1000);
                    }
                },
                error: function() {
                    console.log('suck');
                }
            });
        },

        saveStack: function(data) {
            $.ajax({
                type: 'POST',
                url: '/stack',
                data: {tag : data.items},
                // use json format
                dataType: 'json',
                success: function(data) {

                },
                error: function() {
                    console.log('suck');
                }
            });
        }
    });

});