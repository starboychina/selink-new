define([
    'text!admin/template/announcement/main.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'admin/view/announcement/item',
    'admin/view/announcement/edit'
], function(
    template,
    BaseView,
    BaseCollection,
    ItemView,
    EditView
) {

    var Announcements = BaseCollection.extend({

        url: '/announcements'
    });

    return BaseView.extend({

        // template
        template: template,

        // child view
        childView: ItemView,

        // ui
        ui: {
            createBtn: '.btn-create'
        },

        // events
        events: {
            'click .btn-create': 'showCreateModal',
        },

        // initializer
        initialize: function() {

            this.itemEvents = _.extend({}, this.itemEvents, {
                'edit': 'showEditorModal'
            });

            // this.collectionEvents = _.extend({}, this.collectionEvents, {
            //     'change': 'updateAnnouncement',
            //     'add': 'updateAnnouncement'
            // });

            // create posts collection
            this.collection = new Announcements();

            // call super initializer
            BaseView.prototype.initialize.apply(this);
        },

        // show editor for new announcement
        showCreateModal: function() {

            var editView = new EditView({
                collection: this.collection,
            });

            selink.modalArea.show(editView);
            selink.modalArea.$el.modal('show');
        },

        // save/update announcement
        updateAnnouncement: function(announcement) {

            var self = this;

            // if this is a new announcement
            if (announcement.isNew()) {

                // create the announcement
                this.collection.create(announcement, {
                    // announcement saved successful
                    success: function(model, response, options) {
                        selink.modalArea.$el.modal('hide');
                    },
                    silent: true,
                    wait: true
                });

            } else {

                // update the announcement
                announcement.save(null, {
                    // announcement saved successful
                    success: function(model, response, options) {
                        selink.modalArea.$el.modal('hide');
                    },
                    silent: true,
                    patch: true,
                    wait: true
                });
            }
        }

    });
});