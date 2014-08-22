define([
    'text!common/template/group/detail.html',
    'text!common/template/people/popover.html',
    'common/view/composite-isotope',
    'common/view/group/detail/cover',
    'common/view/group/detail/name',
    'common/view/group/detail/description',
    'common/view/group/detail/events',
    'common/view/group/detail/members',
    'common/view/group/detail/member/participants',
    'common/view/group/detail/member/invited',
    'common/view/calendar/event',
    'common/collection/base',
    'common/model/event',
    'common/model/post',
    'common/view/post/item',
    'common/view/post/new'
], function(
    template,
    popoverTemplate,
    BaseView,
    CoverItem,
    NameItem,
    DescriptionItem,
    EventsItem,
    MembersItem,
    MemberView,
    InvitedView,
    EventView,
    BaseCollection,
    EventModel,
    PostModel,
    ItemView,
    NewPostView
) {

    var PostsCollection = BaseCollection.extend({

        model: PostModel,

        url: function() {
            return '/groups/' + this.document.id + '/posts';
        }
    });

    // profile view
    return BaseView.extend({

        // template
        template: template,

        // child view
        childView: ItemView,

        // events
        events: {
            'click .btn-join': 'onJoin',
            'click .avatar-owner': 'toProfile',
            'click .btn-event': 'showEventEditor',
            'click .btn-member': 'showMemberView',
            'click .btn-invited': 'showInvitedView'
        },

        modelEvents: {
            'change:invited': 'renderInvited',
            'change:participants': 'renderParticipants'
        },

        // initializer
        initialize: function() {

            // create posts collection
            this.collection = new PostsCollection(null, {document: this.model});

            // if (_.indexOf(this.model.get('participants'), selink.user.id) >= 0) {
            if (this.model.get('_owner')._id == selink.user.id) {
                // create component
                this.coverItem = new CoverItem({model: this.model});
                this.nameItem = new NameItem({model: this.model});
                this.descriptionItem = new DescriptionItem({model: this.model});
            }

            this.eventsItem = new EventsItem({model: this.model});
            this.listenTo(this.eventsItem, 'ensureLayout', BaseView.prototype.ensureLayout);

            this.membersItem = new MembersItem({model: this.model});

            this.newPostView = new NewPostView({
                targetGroup: this.model,
                targetCollection: this.collection
            });

            // create region manager (this composite view will have layout ability)
            this.rm = new Backbone.Marionette.RegionManager();
            // create regions
            this.regions = this.rm.addRegions({
                coverRegion: '#cover',
                nameRegion: '#name',
                descriptionRegion: '#description',
                eventsRegion: '#events',
                membersRegion: '#members',
                newPostRegion: '#new-post'
            });
        },

        // after render
        onRender: function() {

            // add popover on author photo
            this.$el.find('.avatar').popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto top',
                title: '<img src="' + this.model.get('_owner').cover + '" />',
                content: _.template(popoverTemplate, this.model.get('_owner')),
            });

            this.$el.find('.fa-group').tooltip({
                placement: 'top',
                title: this.model.get('participants').length + "人参加中"
            });

            this.$el.find('.fa-paper-plane').tooltip({
                placement: 'top',
                title: this.model.get('invited').length + "人要請中"
            });

            // add tooltip on add button
            this.$el.find('.fa-tasks').tooltip({
                placement: 'top',
                title: "イベント" + this.model.get('events').length + "件"
            });

            this.$el.find('.fa-edit').tooltip({
                placement: 'top',
                title: "投稿" + this.model.get('posts').length + "件"
            });

            Backbone.Validation.bind(this);
        },

        // After show
        onShow: function() {

            var self = this;

            // if (_.indexOf(this.model.get('participants'), selink.user.id) >= 0) {
            if (this.model.get('_owner')._id == selink.user.id) {
                // show every component
                this.regions.coverRegion.show(this.coverItem);
                this.regions.nameRegion.show(this.nameItem);
                this.regions.descriptionRegion.show(this.descriptionItem);
            }

            this.regions.eventsRegion.show(this.eventsItem);

            this.regions.membersRegion.show(this.membersItem);

            this.regions.newPostRegion.show(this.newPostView);

            // attach infinite scroll
            this.$el.find(this.childViewContainer).infinitescroll({
                navSelector  : '#page_nav',
                nextSelector : '#page_nav a',
                dataType: 'json',
                appendCallback: false,
                loading: {
                    msgText: '<em>投稿を読込み中・・・</em>',
                    finishedMsg: '投稿は全部読込みました',
                },
                path: function() {
                    return '/groups/' + self.model.id + '/posts?before=' + moment(self.collection.last().get('createDate')).unix();
                }
            }, function(json, opts) {

                // if there are more data
                if (json.length > 0)
                    // add data to collection, don't forget parse the json object
                    // this will trigger 'add' event and will call on
                    self.collection.add(json, {parse: true});
            });

            // call super onShow
            BaseView.prototype.onShow.apply(this);
        },

        // before destroy
        onBeforeDestroy: function() {

            // destroy region manager
            this.rm.destroy();

            // call super onBeforeDestroy
            BaseView.prototype.onBeforeDestroy.apply(this);
        },

        // join group
        onJoin: function() {

            var self = this;

            // show loading icon, and prevent user click twice
            this.$el.find('.btn-join').button('loading');

            // create a participant in this group
            this.model.save({
                participants: selink.user.id //TODO: no need to pass this parameter
            }, {
                url: this.model.url() + '/join',
                success: function(model, response, options) {

                    var joinedLabel = $('<span class="text-success"><i class="ace-icon fa fa-check"></i>&nbsp;参加中</span>');

                    // change the add button to label
                    self.$el.find('.btn-join').fadeOut(function() {
                        self.$el.find('.group-info').prepend(joinedLabel);
                    });

                    // hide the warning message and display the post eidtor
                    self.$el.find('.alert-area').slideUp(function() {
                        self.$el.find('.post-area').slideDown(function() {
                            self.ensureLayout();
                        });
                    });

                    // sycn with user model
                    selink.user.get('groups').push(self.model.id);
                },
                patch: true,
                wait: true
            });
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on user's photo
            this.$el.find('.avatar').popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.get('_owner')._id;
        },
        
        renderInvited: function() {
            this.$el.find('.invitationNum').empty().text(this.model.get('invited').length);
        },

        renderParticipants: function() {
            this.$el.find('.participantsNum').empty().text(this.model.get('participants').length);
        },

        // edit group event
        showEventEditor: function() {

            // create a event editor modal, pass it the event collection
            var eventModal = new EventView({
                model: new EventModel({
                    group: this.model.id,
                    start: Date()
                }),
                collection: this.model.events
            });

            // show modal
            selink.modalArea.show(eventModal);
            selink.modalArea.$el.modal('show');
        },

        showMemberView: function() {

            var memberModal = new MemberView({
                model: this.model
            });

            // show modal
            selink.modalArea.show(memberModal);
            selink.modalArea.$el.modal('show');
        },

        showInvitedView: function() {

            var invitedModal = new InvitedView({
                model: this.model
            });

            // show modal
            selink.modalArea.show(invitedModal);
            selink.modalArea.$el.modal('show');
        }

    });
});