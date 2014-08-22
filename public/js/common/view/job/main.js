define([
    'text!common/template/job/main.html',
    'common/view/composite-isotope',
    'common/view/job/item',
    'common/view/job/edit',
    'common/collection/base',
    'common/model/job'
], function(
    template,
    BaseView,
    ItemView,
    EditView,
    BaseCollection,
    JobModel
) {

    // Job collection
    var JobCollection = BaseCollection.extend({

        model: JobModel,

        url: '/jobs'
    });

    return BaseView.extend({

        // Template
        template: template,

        // child view
        childView: ItemView,

        // event
        events: {
            'click .btn-create': 'showCreateModal'
        },

        // Initializer
        initialize: function() {

            // create job collection
            this.collection = new JobCollection();

            // call super initializer
            BaseView.prototype.initialize.apply(this);
        },

        // display create job modal
        showCreateModal: function() {

            var jobEditView = new EditView();

            this.listenTo(jobEditView, 'createNewJob', this.createJob);

            selink.modalArea.show(jobEditView);
            selink.modalArea.$el.modal('show');
        },

        // create new job
        createJob: function(model) {

            // safe the job
            this.collection.create(model, {
                // job saved successful
                success: function(model, response, options) {
                    selink.modalArea.$el.modal('hide');
                },
                wait: true
            });
        }

    });
});