define([
    'text!common/template/topnav/message/menu.html',
    'common/collection/base',
    'common/model/message',
    'common/view/topnav/message/item',
    'common/view/topnav/message/empty'
], function(
    template,
    BaseCollection,
    MessageModel,
    ItemView,
    EmptyView
) {

    var MessagesCollection = BaseCollection.extend({

        model: MessageModel,

        url:  '/messages/unread',
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // tag name
        tagName: 'li',

        // class name
        className: 'light-green',

        // child view
        childView: ItemView,

        // child view container
        childViewContainer: '.dropdown-body',

        // empty view
        emptyView: EmptyView,

        // model events
        modelEvents: {
            'change:count': 'updateBadge'
        },

        // // collection events
        // collectionEvents: {
        //     'add': 'updateBadge',
        //     'remove': 'updateBadge'
        // },

        // initializer
        initialize: function() {

            var self = this;

            // model is used for retrive message number
            this.model = new Backbone.Model();

            // create messages collection
            this.collection = new MessagesCollection();

            // accept new messages at real-time
            selink.socket.on('message-new', function(data) {
                $.gritter.add({
                    title: data._from.firstName + ' ' + data._from.lastName,
                    text: data.subject,
                    image: data._from.photo_ref,
                    time: 8000,
                    class_name: 'gritter-success'
                });

                // add the notification to collection
                self.collection.add(data, {at: 0});
                // increase the count on model, this will trigger the updateBadge
                self.model.set('count', self.model.get('count') + 1);

                // if the mailboxView were displayed
                if (selink.mailboxView)
                    // add new message at the head of list
                    selink.mailboxView.inBox.collection.add(data, {at: 0, parse: true});
            });
        },

        // after show
        onShow: function() {

            var self = this;

            // keep dropdown menu open when click on the menu items.
            this.$el.find('.dropdown-menu').on('click', function(e){
                e.stopPropagation();
            });

            // make dropdown menu scrollable
            this.$el.find('.dropdown-body').niceScroll();

            // get the number of messages
            this.model.fetch({

                // this url only return a number
                url: '/messages/unread/count',

                // this.model will have only one data: count
                success: function(model, response, options) {

                    // if the nubmer of event greater than 0
                    if (response.count > 0) {

                        // fetch the messages
                        self.collection.fetch();

                        // attach infinite scroll
                        self.$el.find(self.childViewContainer).infinitescroll({
                            navSelector  : '#message_page_nav',
                            nextSelector : '#message_page_nav a',
                            behavior: 'local',
                            binder: self.$el.find(self.childViewContainer),
                            dataType: 'json',
                            appendCallback: false,
                            loading: {
                                msgText: '<em>読込み中・・・</em>',
                                finishedMsg: 'メッセージは全部読込みました'
                            },
                            path: function(pageNum) {
                                return '/messages/unread?before=' + moment(self.collection.last().get('createDate')).unix();
                            }
                        }, function(json, opts) {

                            // if there are more data
                            if (json.length > 0)
                                // add data to collection, don't forget parse the json object
                                // this will trigger 'add' event and will call on
                                self.collection.add(json, {parse: true});
                        });
                    }
                }
            });

        },

        // update the number badge when collection changed
        updateBadge: function() {

            var msgNum = this.model.get('count') > 99 ? '99+' : this.model.get('count');

            // badge
            var $badge = this.$el.find('.dropdown-toggle .badge');

            // if no more messages
            if (msgNum === 0)
                // remove the badge
                $badge.slFlipOutY().remove();
            // if badge not exists
            else if ($badge.length === 0)
                // create badge and show it
                $('<span class="badge badge-success">' + msgNum + '</span>')
                    .appendTo(this.$el.find('.dropdown-toggle')).slFlipInY();
            // or
            else
                // update badge
                $badge.empty().text(msgNum).removeClass('flipOutY').slFlipInY();

            // update notification number on title
            this.$el.find('.title-num').empty().text(msgNum);

            if (msgNum > 0)
                // let the icon swing
                this.$el.find('.fa-envelope').slJump();
        }
    });
});