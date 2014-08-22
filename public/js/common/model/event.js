define(['common/model/base'], function(BaseModel) {

    return BaseModel.extend({

        validation: {
            title: {
                required: true,
                msg: "イベントのタイトルをご入力ください"
            },
            startDate: [{
                required: true,
                msg: "開始日をご入力ください"
            }, {
                dateJa: true,
                msg: "有効な日付でご入力ください"
            }],
            endDate: {
                dateJa: true,
                msg: "有効な日付でご入力ください"
            }
        },

        // Parse data
        parse: function(response, options) {

            if (response._owner === selink.user.id)
                response.isMine = true;
            else
                response.isMine = false;

            // parse date from ISO8601 date to javascript date
            if(response.start) {
                response.start = moment(response.start).toDate();
            }

            if(response.end) {
                response.end = moment(response.end).toDate();
            }

            return response;
        }
    });
});