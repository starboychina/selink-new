define([
    'text!common/template/topnav/topnav.html',
    'common/view/topnav/event/menu',
    'common/view/topnav/message/menu',
    'common/view/topnav/notification/menu',
    'common/view/setting/main',
    'common/view/password/main'
], function(
    template,
    EventMenu,
    MessageMenu,
    NotificationMenu,
    SettingView,
    PasswordView
) {

    var ReplaceRegion = Backbone.Marionette.Region.extend({

        attachHtml: function(view) {
            this.$el.hide();
            this.$el.replaceWith(view.el);
            this.$el.slideDown("fast");
        }
    });

    return Backbone.Marionette.LayoutView.extend({

        // template
        template: template,

        ui: {
            completeness: '.completeness-value',
            bar: '.progress-bar',
            searchTxt: '.form-search input',
            searchBtn: '.btn-search',
            inputFile: 'input[type="file"]'
        },

        events: {
            'click #setting': 'showSettingView',
            'click #password': 'showPasswordView',
            'click @ui.searchBtn': 'onSearch',
            'submit form': 'onSearch'
        },

        // model events
        modelEvents: {
            'change:photo': 'updatePhoto',
            'change': 'updateCompleteness'
        },

        // regions
        regions: {
            eventNavRegion: {
                selector: '#event-nav',
                regionClass: ReplaceRegion
            },
            notificationNavRegion: {
                selector: '#notification-nav',
                regionClass: ReplaceRegion
            },
            messageNavRegion: {
                selector: '#message-nav',
                regionClass: ReplaceRegion
            }
        },

        // initializer
        initialize: function() {

            this.model = selink.user;

            // create event menu
            this.eventNav = new EventMenu();

            // create notification menu
            this.notificationNav = new NotificationMenu();

            // create message menu
            this.messageNav = new MessageMenu();

            this.model.set({'completeness': this.model.completeness()}, {silent: true});
        },

        onRender: function() {

            var self = this;

            this.ui.inputFile.fileupload({
                type: 'PUT',
                dataType: 'json',
                done: function(e, data) {

                    // self.model.set('photoOriginal', data.result.fileName);

                    // var cropView = new CropView({model: self.model});

                    // selink.modalArea.show(cropView);
                    // selink.modalArea.$el.modal('show');
                },
                error: function() {
                    // show error
                    $.gritter.add({
                        title: 'ファイルアップロードが失敗しました',
                        text: '画像は「jpg」、「gif」、「png」のフォーマットのみ受け付けます。お手数ですが、お確かめ上に、もう一度アップロードしてください。',
                        class_name: 'gritter-error'
                    });
                }
            });
        },

        // after show
        onShow: function() {

            // show every menu
            this.eventNavRegion.show(this.eventNav);
            this.notificationNavRegion.show(this.notificationNav);
            this.messageNavRegion.show(this.messageNav);
        },

        showSettingView: function(event) {

            event.preventDefault();

            // create setting view
            var settingView = new SettingView({
                model: selink.user
            });

            // attention: access the selink object directly here
            selink.modalArea.show(settingView);

            selink.modalArea.$el.modal('show');
        },

        showPasswordView: function(event) {

            event.preventDefault();

            // create password reset view
            var passwordView = new PasswordView({
                model: selink.user
            });

            // attention: access the selink object directly here
            selink.modalArea.show(passwordView);

            selink.modalArea.$el.modal('show');
        },

        // update user photo when changed
        updatePhoto: function() {

            var self = this;

            this.$el.find('.nav-user-photo').slRollOut('', function() {
                $(this).attr('src', self.model.get('photo_ref'));
                $(this).removeClass('rollOut').addClass('rollIn');
            });
        },

        updateCompleteness: function() {

            var completeness = this.model.completeness(),
                progressClass = "progress-bar";

            if (completeness == 100) {
                progressClass += ' progress-bar-success';
            } else if (completeness > 85) {
                // progressClass = 'progress-bar';
            } else if (completeness > 70) {
                progressClass += ' progress-bar-warning';
            } else if (completeness > 50) {
                progressClass += ' progress-bar-pink';
            } else if (completeness > 30) {
                progressClass += ' progress-bar-purple';
            } else {
                progressClass += ' progress-bar-danger';
            }

            this.ui.completeness.empty().text(completeness + '%');
            this.ui.bar.removeClass().addClass(progressClass);
            this.ui.bar.css('width', completeness + '%');
        },

        // search
        onSearch: function(e) {

            e.preventDefault();

            // do nothing if input is blank
            if (_.str.isBlank(this.ui.searchTxt.val()))
                return;

            window.location = '#search/'+ this.ui.searchTxt.val();
        }

    });
});