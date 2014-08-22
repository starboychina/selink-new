define(['common/model/base'], function(BaseModel) {

    return BaseModel.extend({

        validation: {

            name: [{
                required: true,
                msg: "資格名をご入力ください"
            },{
                maxLength: 50,
                msg: "最大50文字までご入力ください"
            }],
            acquireDate: {
                dateJa: true
            }
        }
    });
});