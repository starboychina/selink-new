define([
    'text!common/template/people/detail.html',
    'common/collection/base',
    'common/model/post',
    'common/view/composite-isotope',
    'common/view/post/item',
    'common/view/people/detail/friends',
    'common/view/people/detail/groups',
    'common/view/people/detail/languages',
    'common/view/people/detail/skills',
    'common/view/people/detail/qualifications',
    'common/view/people/detail/educations',
    'common/view/people/detail/employments',
    'common/view/mailbox/edit'
], function(
    template,
    BaseCollection,
    PostModel,
    BaseView,
    ItemView,
    FriendsView,
    GroupsView,
    LanguagesView,
    SkillsView,
    QualificationsView,
    EducationsView,
    EmploymentsView,
    MessageEditView
) {

    var PostsCollection = BaseCollection.extend({

        model: PostModel,

        url: function() {
            return '/users/' + this.document.id + '/posts';
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
            'click .btn-msg': 'showMessageEditor',
            'click .btn-friend': 'onAddFriend',
            'click .btn-break': 'showAlert',
            'click .btn-break-cancel': 'hideAlert',
            'click .btn-break-confirm': 'onBreakFriend',
            'click .btn-more': 'showMoreInfo',
            'click .btn-less': 'showLessInfo'
        },

        // initializer
        initialize: function() {

            var self = this;

            // create languages view
            if (this.model.languages.length)
                this.languagesView = new LanguagesView({collection: this.model.languages});

            // create skills view
            if (this.model.skills.length)
                this.skillsView = new SkillsView({collection: this.model.skills});

            // create qualifications view
            if (this.model.qualifications.length)
                this.qualificationsView = new QualificationsView({collection: this.model.qualifications});

            // create educations view
            if (this.model.educations.length)
                this.educationsView = new EducationsView({collection: this.model.educations});

            // create employments view
            if (this.model.employments.length)
                this.employmentsView = new EmploymentsView({collection: this.model.employments});

            // create friends view
            if (this.model.get('friends').length)
                this.friendsView = new FriendsView({model: this.model});

            // create groups view
            if (this.model.get('groups').length)
                this.groupsView = new GroupsView({model: this.model});

            // create post collection
            this.collection = new PostsCollection(null, {document: this.model});

        },

        // after render
        onRender: function() {
            // create region manager (this composite view will have Layout ability)
            this.rm = new Backbone.Marionette.RegionManager();
            // create regions
            this.regions = this.rm.addRegions({
                // historyRegion: '#history',
                friendsRegion: '#friends',
                groupsRegion: '#groups',
                languagesRegion: '#languages-display',
                skillsRegion: '#skills',
                qualificationsRegion: '#qualifications',
                educationsRegion: '#educations',
                employmentsRegion: '#employments',
            });
        },

        // after show
        onShow: function() {

            var self = this;

            // show friends view
            if (this.friendsView)
                this.regions.friendsRegion.show(this.friendsView);

            // show groups view
            if (this.groupsView)
                this.regions.groupsRegion.show(this.groupsView);

            // show languages view
            if (this.languagesView)
                this.regions.languagesRegion.show(this.languagesView);

            // show skills view
            if (this.skillsView)
                this.regions.skillsRegion.show(this.skillsView);

            // show qualifications view
            if (this.qualificationsView)
                this.regions.qualificationsRegion.show(this.qualificationsView);

            // show educations view
            if (this.educationsView)
                this.regions.educationsRegion.show(this.educationsView);

            // show employments view
            if (this.employmentsView)
                this.regions.employmentsRegion.show(this.employmentsView);

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
                    return '/users/' + self.model.id + '/posts?before=' + moment(self.collection.last().get('createDate')).unix();
                }
            }, function(json, opts) {

                // if there are more data
                if (json.length > 0)
                    // add data to collection, don't forget parse the json object
                    // this will trigger 'add' event and will call on
                    self.collection.add(json, {parse: true});
            });

            // call super initializer
            BaseView.prototype.onShow.apply(this);
        },

        // before destroy
        onBeforeDestroy: function() {
            // destroy region manager
            this.rm.destroy();
            // call super onBeforeDestroy
            BaseView.prototype.onBeforeDestroy.apply(this);
        },

        // show break confirm alert
        showAlert: function(event) {

            var self = this;

            // stop defautl link behavior
            event.preventDefault();
            // show break confirm alert
            this.$el.find('.alert')
                .slideDown('fast', function() {
                    self.$el.find(self.childViewContainer).isotope('layout');
                })
                .find('i')
                .addClass('icon-animated-vertical');
        },

        // hide break confirm alert
        hideAlert: function() {

            var self = this;

            this.$el.find('.alert')
                .slideUp('fast', function() {
                    self.$el.find(self.childViewContainer).isotope('layout');
                });
        },

        showMessageEditor: function() {

            var messageEditor = new MessageEditView({
                recipient: [this.model.toJSON()]
            });

            selink.modalArea.show(messageEditor);
            selink.modalArea.$el.modal('show');
        },

        showMoreInfo: function() {

            var self = this;
            this.$el.find('.more-info').slideDown('fast', function() {
                self.$el.find('.btn-more').addClass('hide');
                self.$el.find('.btn-less').removeClass('hide');
                self.ensureLayout();
            });
        },

        showLessInfo: function() {

            var self = this;
            this.$el.find('.more-info').slideUp('fast', function() {
                self.$el.find('.btn-more').removeClass('hide');
                self.$el.find('.btn-less').addClass('hide');
                self.ensureLayout();
            });
        },

        // add this person as friend
        onAddFriend: function() {

            var self = this;

            // show loading icon, and prevent user click twice
            this.$el.find('.btn-friend').button('loading');

            // create a friend in invited list
            selink.user.save({
                id: this.model.get('_id')
            }, {
                url: '/connections/invite',
                success: function() {
                    // change the label of the add button, but still disabled
                    self.$el.find('.btn-friend')
                        .removeClass('btn-info btn-friend')
                        .addClass('btn-success')
                        .empty()
                        .html('<i class="ace-icon fa fa-check light-green"></i>&nbsp;友達リクエスト送信済み');
                },
                patch: true,
                wait: true
            });
        },

        // break up with this person
        onBreakFriend: function() {

            var self = this;

            this.hideAlert();

            // show loading icon, and prevent user click twice
            this.$el.find('.btn-break').button('loading');

            // remove this person from user's friends list
            selink.user.save({
                id: this.model.get('_id')
            },{
                url: '/connections/break',
                success: function() {
                    // change the button for success info, but won't enable it
                    self.$el.find('.btn-break')
                        .removeClass('btn-info btn-break')
                        .addClass('btn-grey')
                        .empty()
                        .html('<i class="ace-icon fa fa-check light-green"></i>&nbsp;友達解除しました');
                },
                patch: true,
                wait: true
            });
        }

    });
});