define([
    'common/model/base'
], function(
    BaseModel
) {

    return BaseModel.extend({

        // Url root
        urlRoot: '/jobs',

        // Parse data
        parse: function(response, options) {

            // parse date from iso-date to readable format
            if(response.expiredDate) {
                response.expiredDateDisplay = moment(response.expiredDate).format('LL');
                response.expiredDateInput = moment(response.expiredDate).format('L');
            }

            if(response.startDate) {
                response.startDateDisplay = moment(response.startDate).format('LL');
                response.startDateInput = moment(response.startDate).format('L');
            }

            if(response.endDate) {
                response.endDateDisplay = moment(response.endDate).format('LL');
                response.endDateInput = moment(response.endDate).format('L');
            }

            if(response.createDate) {
                response.createDateDisplay = moment(response.createDate).format('LL');
                response.createDateInput = moment(response.createDate).format('L');
            }

            var userId = selink.user.get('_id');

            // if the owner's id is user's id
            if (response._owner._id == userId)
                // mark as 'my' job
                response.isMine = true;
            else
                response.isMine = false;

            // if user's id exists in post's bookmark list
            if (_.indexOf(response.bookmarked, userId) >= 0)
                // mark as marked
                response.isMarked = true;
            else
                response.isMarked = false;

            return response;
        },

        validation: {
            name: [{
                required: true,
                msg: "案件名称をご入力ください"
            },{
                maxLength: 50,
                msg: "最大50文字までご入力ください"
            }],
            address: {
                maxLength: 100,
                msg: "最大100文字までご入力ください"
            },
            expiredDate: {
                required: true,
                datetimeJa: true
            },
            startDate: {
                required: false,
                dateJa: true
            },
            endDate: {
                required: false,
                dateJa: true
            }
        }

    });
});