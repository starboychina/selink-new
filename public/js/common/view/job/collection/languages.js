define([
    'common/collection/base',
    'common/model/language'
], function(
    BaseCollection,
    LanguageModel
) {

    // Languages Collection
    return BaseCollection.extend({

        model: LanguageModel,

        url: function() {
            return this.document.url() + '/languages';
        },

        comparator: function(language) {
            // sort by weight desc
            if (language.get('weight'))
                return 0 - Number(language.get('weight'));
            else
                return 0;
        }
    });
});