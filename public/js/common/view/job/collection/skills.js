define([
    'common/collection/base',
    'common/model/skill'
], function(
    BaseCollection,
    SkillModel
) {

    // Skills Collection
    return BaseCollection.extend({

        model: SkillModel,

        url:  function() {
            return this.document.url() + '/skills';
        },

        comparator: function(skill) {
            // sort by weight desc
            if (skill.get('weight'))
                return 0 - Number(skill.get('weight'));
            else
                return 0;
        }
    });

});