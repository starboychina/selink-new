define([], function() {
    return Backbone.DeepModel.extend({
        // adapt mongodb document
        idAttribute: "_id"
    });
});