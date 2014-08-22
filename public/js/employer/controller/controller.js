define([
    'common/view/topnav/topnav',
    'employer/view/common/sidenav',
    'employer/view/home/main',
    'common/view/search/main',
    'common/view/profile/main',
    'common/view/post/main',
    'common/view/post/detail',
    'common/view/job/main',
    'common/view/group/main',
    'common/view/group/detail',
    'common/view/people/main',
    'common/view/people/detail',
    'common/view/bookmark/main',
    'common/view/calendar/main',
    'common/view/activity/main',
    'common/view/notification/main',
    'common/view/mailbox/main',
    'common/model/user',
    'common/model/post',
    'common/model/group'
], function(
    TopNavView,
    SideNavView,
    HomeView,
    SearchView,
    ProfileView,
    PostView,
    PostDetailView,
    JobView,
    GroupView,
    GroupDetailView,
    PeopleView,
    PeopleDetailView,
    BookMarkView,
    CalendarView,
    ActivityView,
    NotificationView,
    MailBoxView,
    UserModel,
    PostModel,
    GroupModel
) {

    // Main page controller
    return Backbone.Marionette.Controller.extend({

        // Initializer of main page controller
        initialize: function(options) {

            var self = this;

            // setup navigation bar
            this.showNavigation();

            // at the first time the page was opened, move to home page
            if (window.location.hash === "") {
                window.location = '#home';
            }
        },

        showNavigation: function() {

            // setup side nav
            selink.sideNavView = new SideNavView();
            selink.sidenavArea.show(selink.sideNavView);

            // setup top nav
            selink.topNavView = new TopNavView();
            selink.topnavArea.show(selink.topNavView);
        },

        showHomeView: function() {

            // create home view
            selink.homeView = new HomeView({
                model: selink.user,
                sort: false
            });
            // show main page
            selink.pageContent.show(selink.homeView);
        },

        // show search view
        showSearchView: function(term) {

            // create search view
            selink.searchView = new SearchView({
                model: new Backbone.Model({term: term})
            });
            // show main page
            selink.pageContent.show(selink.searchView);
        },

        // show profile
        showProfileView: function(id) {

            if (!id || id === selink.user.get('_id')) {

                // create profile view
                selink.profileView = new ProfileView({
                    model: selink.user
                });
                // show profile view
                selink.pageContent.show(selink.profileView);

            } else {

                var people = new UserModel({_id: id});
                people.fetch({
                    success: function() {
                        selink.peopleDetailView = new PeopleDetailView({
                            model: people
                        });
                        selink.pageContent.show(selink.peopleDetailView);
                    }
                });
            }
        },

        // show posts
        showPostView: function(id) {

            if (id) {

                var post = new PostModel({_id: id});
                post.fetch({
                    success: function() {

                        var postDetailView = new PostDetailView({
                            model: post,
                            modal: true
                        });

                        selink.modalArea.show(postDetailView);
                        selink.modalArea.$el.modal('show');
                    }
                });

            } else {

                // create post view
                selink.postView = new PostView();
                // show post view
                selink.pageContent.show(selink.postView);
            }
        },

        showJobView: function() {
            selink.jobIndexView = new JobView();
            selink.pageContent.show(selink.jobIndexView);
        },

        // show groups
        showGroupView: function(id) {

            if (!id || id == 'joined' || id == 'mine' || id == 'discover') {

                // create group view
                selink.groupView = new GroupView({type: id});
                // show group view
                selink.pageContent.show(selink.groupView);

            } else {

                var group = new GroupModel({_id: id});
                group.fetch({
                    success: function() {

                        selink.groupDetailView = new GroupDetailView({
                            model: group
                        });
                        selink.pageContent.show(selink.groupDetailView);
                    }
                });

            }
        },

        // show people
        showPeopleView: function(id) {

            // create people view
            selink.peopleView = new PeopleView({type: id});
            // show people view
            selink.pageContent.show(selink.peopleView);
        },

        // show bookmark
        showBookmarkView: function() {

            // create bookmark view
            selink.bookmarkView = new BookMarkView({
                sort: false
            });
            // show bookmark view
            selink.pageContent.show(selink.bookmarkView);
        },

        // show calendar
        showCalendarView: function() {

            // create calendar view
            selink.calendarView = new CalendarView();
            // show calendar view
            selink.pageContent.show(selink.calendarView);
        },

        // show activity
        showActivityView: function() {

            // create activity view
            selink.activityView = new ActivityView();
            // show activity view
            selink.pageContent.show(selink.activityView);
        },

        // show notification
        showNotificationView: function() {

            // create notification view
            selink.notificationView = new NotificationView();
            // show notification view
            selink.pageContent.show(selink.notificationView);
        },

        // show mailbox
        showMailBoxView: function() {

            // create mailbox view
            selink.mailboxView = new MailBoxView();
            // show mailbox view
            selink.pageContent.show(selink.mailboxView);
        }
    });
});