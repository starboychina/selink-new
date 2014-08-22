define([
    'common/model/base',
    'common/collection/base',
    'common/model/event'
], function(
    BaseModel,
    BaseCollection,
    EventModel
) {

    return BaseModel.extend({

        // Url root
        urlRoot: '/groups',

        validation: {
            name: {
                required: true,
                msg: "グループの名称を入力しよう！"
            }
        }

    });
});