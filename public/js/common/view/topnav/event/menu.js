define([
    'text!common/template/topnav/event/menu.html',
    'common/collection/base',
    'common/model/event',
    'common/view/topnav/event/item',
    'common/view/topnav/event/empty'
], function(
    template,
    BaseCollection,
    EventModel,
    ItemView,
    EmptyView
) {

    var EventsCollection = BaseCollection.extend({

        model: EventModel,

        url:  function() {
            return '/events?after=' + moment().unix();
        }
    });

    return Backbone.Marionette.CompositeView.extend({

        // template
        template: template,

        // tag name
        tagName: 'li',

        // class name
        className: 'light-blue2',

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

        // initializer
        initialize: function() {

            var self = this;

            // model is used for retrive event number
            this.model = new Backbone.Model();

            // create events collection
            this.collection = new EventsCollection();

            // accept group event real-time
            selink.socket.on('group-event-new', function(data) {
                $.gritter.add({
                    title: '<img src="' + data.group.cover + '">',
                    text: data.group.name + 'イベント開催しました。<br/><strong>' + data.title + '</strong>',
                    time: 8000,
                    class_name: 'gritter-success'
                });
                // add the notification to collection
                self.collection.add(data, {at: 0});
                // increase the count on model, this will trigger the updateBadge
                self.model.set('count', self.model.get('count') + 1);
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

            // get the number of notifications
            this.model.fetch({

                // this url only return a number
                url: '/events/count',

                // this.model will have only one data: count
                success: function(model, response, options) {

                    // if the nubmer of event greater than 0
                    if (response.count > 0) {

                        // fetch the notifications
                        self.collection.fetch();

                        // attach infinite scroll
                        self.$el.find(self.childViewContainer).infinitescroll({
                            navSelector  : '#event_page_nav',
                            nextSelector : '#event_page_nav a',
                            behavior: 'local',
                            binder: self.$el.find(self.childViewContainer),
                            dataType: 'json',
                            appendCallback: false,
                            loading: {
                                msgText: '<em>読込み中・・・</em>',
                                finishedMsg: 'イベントは全部読込みました'
                            },
                            path: function(pageNum) {
                                return '/events?after=' + moment(self.collection.last().get('start')).unix();
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

            // filter out the past events
            var eventNum = this.model.get('count') > 99 ? '99+' : this.model.get('count');

            // badge
            var $badge = this.$el.find('.dropdown-toggle .badge');

            // TODO: this is crap. if no more events
            if (eventNum === 0)
                // remove the badge
                $badge.slFlipOutY().remove();
            // if badge not exists
            else if ($badge.length === 0)
                // create badge and show it
                $('<span class="badge badge-primary">' + eventNum + '</span>')
                    .appendTo(this.$el.find('.dropdown-toggle')).slFlipInY();
            // or
            else
                // update badge
                $badge.empty().text(eventNum).removeClass('flipOutY').slFlipInY();

            // update notification number on title
            this.$el.find('.title-num').empty().text(eventNum);

            if (eventNum > 0)
                // let the icon swing
                this.$el.find('.fa-tasks').slJump();

        }
    });
});