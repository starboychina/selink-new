define([
    'text!common/template/group/detail/event.html',
    'text!common/template/calendar/popover.html',
    'common/view/calendar/event'
], function(
    template,
    popoverTemplate,
    EventView
) {

    return Backbone.Marionette.ItemView.extend({

        // template
        template: template,

        className: 'external-event label label-xlg arrowed arrowed-right',

        events: {
            'click': 'editEvent'
        },

        onRender: function() {

            if (this.model.get('className'))
                this.$el.addClass(this.model.get('className'));
            else
                this.$el.addClass('label-primary');
        },

        onShow: function() {

            this.$el.popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.collection.document.get('cover') + '" />',
                content: _.template(popoverTemplate, this.model.attributes),
            });
        },

        editEvent: function() {

            if (!this.model.get('isMine'))
                return;

            // create a event editor modal, pass it the event collection
            var eventModal = new EventView({
                model: this.model,
                collection: this.model.collection
            });

            // show modal
            selink.modalArea.show(eventModal);
            selink.modalArea.$el.modal('show');

        }

    });
});