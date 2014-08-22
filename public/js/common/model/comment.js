define([
    'common/model/base'
], function(
    BaseModel
) {

    return BaseModel.extend({

        validation: {
            content: {
                required: true,
                msg: "コメントの中身を入力しよう！"
            }
        }

    });
});