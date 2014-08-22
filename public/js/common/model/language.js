define(['common/model/base'], function(BaseModel) {

    return BaseModel.extend({

        validation: {

            language: {
                required: true,
                msg: "言語を選択してください"
            }
        }
    });
});