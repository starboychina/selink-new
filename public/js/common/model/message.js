define(['common/model/base'], function(BaseModel) {

    return BaseModel.extend({

        // Url root
        urlRoot: '/messages',

        validation: {

            recipient: {
                required: true,
                msg: "宛先をご入力ください"
            },

            subject: {
                required: true,
                msg: "メッセージタイトルをご入力ください"
            },

            message: {
                required: true,
                msg: "本文をご入力ください"
            }
        },

        // Parse data
        parse: function(response, options) {

            var userId = selink.user.get('_id');

            // if the message belong to the user
            if (response._from._id == userId)
                // mark as 'my message'
                response.isMine = true;
            else
                response.isMine = false;

            // if the message not belong to the user
            // or user's id exists in message's opened list
            if (response._from._id != userId && _.indexOf(response.opened, userId) < 0)
                // mark as unread
                response.isUnread = true;
            else
                // mark as read
                response.isUnread = false;

            // if user's id exists in post's bookmark list
            if (_.indexOf(response.bookmarked, selink.user.id) >= 0)
                // mark as marked
                response.isMarked = true;
            else
                response.isMarked = false;

            return response;
        }
    });
});