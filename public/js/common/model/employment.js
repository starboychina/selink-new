define(['common/model/base'], function(BaseModel) {

    return BaseModel.extend({

        validation: {

            startDate: {
                dateJa: true
            },
            endDate: {
                dateJa: true
            },
            company: [{
                required: true,
                msg: "会社名をご入力ください"
            },{
                maxLength: 50,
                msg: "最大50文字までご入力ください"
            }],
            address: {
                maxLength: 50,
                msg: "最大50文字までご入力ください"
            },
            position: {
                maxLength: 50,
                msg: "最大50文字までご入力ください"
            }
        },

        // Parse data
        parse: function(response, options) {

            // parse date from iso-date to readable format
            if(response.startDate) {
                response.startDateDisplay = moment(response.startDate).format('YYYY年M月');
                response.startDateInput = moment(response.startDate).format('YYYY/MM');
            }

            if(response.endDate) {
                response.endDateDisplay = moment(response.endDate).format('YYYY年M月');
                response.endDateInput = moment(response.endDate).format('YYYY/MM');
            }

            return response;
        }
    });
});