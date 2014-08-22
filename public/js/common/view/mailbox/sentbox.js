define([
    'text!common/template/mailbox/sentbox.html',
    'common/view/composite-isotope',
    'common/collection/base',
    'common/model/message',
    'common/view/mailbox/item',
    'common/view/mailbox/empty'
], function(
    template,
    BaseView,
    BaseCollection,
    MessageModel,
    ItemView,
    EmptyView
) {

    var Messages = BaseCollection.extend({

        model: MessageModel,

        url: '/messages/sent',
    });

    return BaseView.extend({

        className: 'message-list',

        // template
        template: template,

        // child view container
        childViewContainer: '.message-container',

        // child view
        childView: ItemView,

        // empty view
        // emptyView: EmptyView,

        // select item
        selectedItem: new Messages(),

        navSelector: '#sentbox-page-nav',

        nextSelector: '#sentbox-page-nav a',

        // ui
        ui: {
            infoBar: '.message-infobar',
            toolBar: '.message-toolbar',
            removeBtn: 'btn-remove'
        },

        // event
        events: {
            'click .toggle-all': 'toggleAll',
            'click .select-all': 'selectAll',
            'click .select-none': 'selectNone',
            'click .btn-remove': 'removeMessage',
            'click .sort-createDate': 'sortCreateDate',
            'click .sort-recipient': 'sortRecipient',
            'click .sort-subject': 'sortSubject'
        },

        // initializer
        initialize: function() {

            // child events
            this.childEvents = _.extend({}, this.childEvents, {
                'selected': 'itemSelected',
                'unselected': 'itemUnselected'
            });

            // create collection
            this.collection = new Messages();

            this.listenTo(this.selectedItem, 'all', this.toggleTools);
        },

        onShow: function() {

            var self = this;

            // enable isotope
            this.$el.find(this.childViewContainer).isotope({
                itemSelector : '.isotope-item',
                stamp: '.stamp',
                masonry: {
                    columnWidth: '.isotope-item'
                },
                getSortData: {
                    createDate: function(elem) {
                        return $(elem).find('[data-create-date]').data('create-date');
                    },
                    recipient: function(elem) {
                        return $(elem).find('.sender').text();
                    },
                    subject: function(elem) {
                        return $(elem).find('.text').text();
                    }
                },
                sortBy: 'createDate',
                sortAscending: false
            });

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#sentbox-page-nav',
                nextSelector : '#sentbox-page-nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>読込み中・・・</em>',
                    finishedMsg: 'メッセージは全部読込みました'
                },
                path: function(pageNum) {
                    return '/messages/sent?before=' + moment(self.collection.last().get('createDate')).unix();
                }
            }, function(json, opts) {

                // if there are more data
                if (json.length > 0)
                    // add data to collection, don't forget parse the json object
                    // this will trigger 'add' event and will call on
                    self.collection.add(json, {parse: true});
            });

            // fetch collection items
            this.collection.fetch();
        },

        // toggle tool bar
        toggleTools: function() {

            // show tool bar when selection is not empty
            if (this.selectedItem.length) {
                this.ui.infoBar.addClass('hide');
                this.ui.toolBar.removeClass('hide');
            } else {
                this.ui.infoBar.removeClass('hide');
                this.ui.toolBar.addClass('hide');
            }
        },

        // toggle selection for all message
        toggleAll: function() {

            var checked = this.$el.find('.toggle-all').prop('checked');
            checked ? this.selectAll() : this.selectNone();
        },

        // select all messages
        selectAll: function(e) {

            var self = this;

            // stop default click event
            if (e) e.preventDefault();

            // clear selected item collection
            this.selectedItem.reset();

            // for each message
            this.children.each(function(view) {
                // mark as selected
                view.selectMessage();
                // add to selected collection
                self.selectedItem.add(view.model);
            });
        },

        // unselect all messaages
        selectNone: function(e) {

            // stop default click event
            if (e) e.preventDefault();

            // clear selected item collection
            this.selectedItem.reset();

            // for each message
            this.children.each(function(view) {
                // mark as unselected
                view.unselectMessage();
            });
        },

        // select one message
        itemSelected: function(view) {
            this.selectedItem.add(view.model);
        },

        // unselect one message
        itemUnselected: function(view) {
            this.selectedItem.remove(view.model);
        },

        // remove selected messages
        removeMessage: function(e) {

            var self = this;

            // stop default click event
            e.preventDefault();

            // for each selected message
            this.selectedItem.each(function(model) {
                // find subview of the message and let it remove the message
                self.children.findByModel(model).removeMessage();
            });
        },

        // sort by message receive date
        sortCreateDate: function(e) {

            // stop default click event
            e.preventDefault();

            this.$el.find(this.childViewContainer).isotope({sortBy: 'createDate'});

            this.$el.find('.sort-menu i').addClass('hide');
            this.$el.find('.sort-createDate i').removeClass('hide');
        },

        // sort by message recipient
        sortRecipient: function(e) {

            // stop default click event
            e.preventDefault();

            this.$el.find(this.childViewContainer).isotope({sortBy: 'recipient'});

            this.$el.find('.sort-menu i').addClass('hide');
            this.$el.find('.sort-recipient i').removeClass('hide');
        },

        // sort by message subject
        sortSubject: function(e) {

            // stop default click event
            e.preventDefault();

            this.$el.find(this.childViewContainer).isotope({sortBy: 'subject'});

            this.$el.find('.sort-menu i').addClass('hide');
            this.$el.find('.sort-subject i').removeClass('hide');
        }

    });
});