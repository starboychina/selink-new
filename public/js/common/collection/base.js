define(['common/model/base'], function(BaseModel) {

    return Backbone.Collection.extend({

        // adapt mongodb document
        model: BaseModel,

        initialize: function(models, options) {
            if (options && options.document)
                this.document = options.document;
        }
    });
});