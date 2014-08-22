define(['common/view/composite-empty'], function(EmptyView) {

    return Backbone.Marionette.CompositeView.extend({

        // Empty View
        emptyView: EmptyView,

        // common UI
        ui: {
            addBtn: '.btn-add',
        },

        // common events
        events: {
            // Add a new item when add button clicked
            'click .btn-add': 'addItem',
            'mouseover .widget-header': 'attention'
        },

        // Common events may happend on Collection
        collectionEvents: {
            'change': 'updateItem',
            'remove': 'removeItem',
        },

        // SubView append behavior
        attachHtml: function(collectionView, itemView, index) {

            // TODO: the second condition for stop the bounce effect on empty view ...
            // this happend on user click add button
            // subview's model don't have _id attribute, so it's a new model
            if (itemView.model.isNew() && !itemView.$el.find('.empty-view').length) {
            // if (itemView.model.isNew()) {

                // append the subview
                this.$el.find(this.childViewContainer).append(itemView.el);

                itemView.$el.slBounceIn();

                // show subview's editor panel
                if (itemView.ui && itemView.ui.editor && itemView.ui.value) {

                    itemView.ui.value.hide();

                    itemView.ui.editor.fadeIn(function() {
                        // mark this editor as opened
                        itemView.$el.addClass('sl-editor-open');
                    });
                }
            }
            // this happend on composite initialzation.
            // if the subview's model has _id attribute, it is a existing model
            else {

                // just append the subview
                this.$el.find(this.childViewContainer).append(itemView.el);
            }
        },

        attention: function(event) {
            $(event.target).find('.sl-icon').slSwing();
        },

        // Add new composite item
        addItem: function(event) {
            // add a new model to composite's collection
            this.collection.add({});
            // if the number of items exceed the limitation
            if (this.collection.length >= this.itemLimit)
                // hide the add button
                this.ui.addBtn.fadeOut('fast');
        },

        // Update model
        updateItem: function(model) {

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

        // remove an item from collection
        removeItem: function(model) {

            var self = this;

            // Save the model
            model.destroy({

                // if save success
                success: function(model, response) {
                    // if the number of items fewer than limitation
                    if (self.collection.length < self.itemLimit)
                        // show the add button
                        self.ui.addBtn.fadeIn('fast');
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
                }
            });
        }

    });
});