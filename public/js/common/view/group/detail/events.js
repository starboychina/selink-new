define([
    'text!common/template/group/detail/events.html',
    'common/collection/base',
    'common/view/group/detail/event'
], function(
    template,
    BaseCollection,
    ItemView
) {

    var EventsCollection = BaseCollection.extend({

        url: function() {
            return '/groups/' + this.document.id + '/events?after=' + moment().unix();
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // class name
        className: "widget-box transparent",

        // template
        template: template,

        // child view container
        childViewContainer: '.widget-main',

        // child view
        childView: ItemView,

        // Collection events
        collectionEvents: {
            'add': 'createEvent',
            'change': 'updateEvent',
            'remove': 'removeEvent',
        },

        // initializer
        initialize: function() {

            this.collection = new EventsCollection(null, {document: this.model});
            this.collection.fetch();
        },

        // after render
        onRender: function() {

            // add tooltip on add button
            this.$el.find('.btn-event').tooltip({
                placement: 'top',
                title: "イベント作成",
                container: 'body',
                template: '<div class="tooltip tooltip-info"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
            });
        },

        // create new event
        createEvent: function(event) {

            var self = this;

            // safe the event
            this.collection.create(event, {

                // event saved successful
                success: function(model, response, options) {
                    selink.modalArea.$el.modal('hide');
                    self.trigger('ensureLayout');
                },
                wait: true
            });
        },

        // update event
        updateEvent: function(model) {

            if (model.isNew()) return;

            var self = this;

            // Save the model
            model.save(null , {

                // if save success
                success: function(model, response, options) {
                    selink.modalArea.$el.modal('hide');
                },
                // use patch
                patch: true
            });
        },

        // remove event
        removeEvent: function(model) {

            var self = this;

            model.destroy({
                success: function() {
                    selink.modalArea.$el.modal('hide');
                    self.trigger('ensureLayout');
                },
                wait: true
            });
        }

    });
});