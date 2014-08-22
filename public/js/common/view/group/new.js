define([
    'text!common/template/group/new.html',
    'common/view/group/new/friends',
    'common/view/group/new/people',
    'common/view/group/new/confirm'
], function(
    template,
    FriendsView,
    PeopleView,
    ConfirmView
) {

    return Backbone.Marionette.LayoutView.extend({

        // class name
        className: 'modal-dialog post-modal',

        // template
        template: template,

        // regions
        regions: {
            friendsRegion: '#step4',
            peopleRegion: '#step5',
            confirmRegion: '#confirm',
        },

        ui: {
            groupName: '.group-name',
        },

        events: {
            'click #public-area': 'setGroupPublic',
            'click #protected-area': 'setGroupProtected',
            'click #private-area': 'setGroupPrivate',
        },

        initialize: function() {

            this.friendsView = new FriendsView({model: this.model});

            this.peopleView = new PeopleView({model: this.model});
        },

        onShow: function() {

            var self = this;

            this.$el.find('#group-create-wizard').ace_wizard()
                .on('change' , function(e, info) {

                    if (info.step == 2) {

                        var name = _.str.trim(self.ui.groupName.val());

                        if (_.str.isBlank(name)) {

                            self.ui.groupName
                                .addClass('tooltip-error').tooltip({
                                    placement: 'bottom',
                                    title: 'グループ名称は必須です'
                                })
                                .closest('.form-group').addClass('has-error')
                                .find('i').addClass('animated-input-error');

                            return false;

                        } else {

                            self.model.set('name', name);

                            self.ui.groupName
                                .removeClass('tooltip-error').tooltip('destroy')
                                .closest('.form-group').removeClass('has-error')
                                .find('i').removeClass('animated-input-error');
                        }
                    }

                    if (info.step == 3) {

                        var inputText = self.$el.find('textarea').val(),
                            description = inputText.replace(/(?:\r\n|\r|\n)/g, '<br />');

                        if (!_.str.isBlank(description))
                            self.model.set('description', description);

                        // show friends area
                        self.friendsRegion.show(self.friendsView);
                    }

                    if (info.step == 4) {
                        // show people area
                        self.peopleRegion.show(self.peopleView);
                    }

                    if (info.step == 5) {

                        // show confirm view, we create this view here for the display the latest information on model
                        self.confirmView = new ConfirmView({model: self.model});
                        self.confirmRegion.show(self.confirmView);
                    }
                }).on('finished', function(e) {
                    
                    var inviteIdList = _.pluck(self.model.get('invited'), 'id');

                    self.model.set('invited', inviteIdList);
                    
                    self.model.save(null, {
                        success: function() {
                            selink.modalArea.$el.modal('hide');
                        }
                    });
                });
        },

        setGroupPublic: function() {
            this.$el.find('.alert').removeClass('alert-info alert-warning');
            this.$el.find('#public-area').addClass('alert-success');
            this.model.set('type', 'public');
        },

        setGroupProtected: function() {
            this.$el.find('.alert').removeClass('alert-success alert-warning');
            this.$el.find('#protected-area').addClass('alert-info');
            this.model.set('type', 'protected');
        },

        setGroupPrivate: function() {
            this.$el.find('.alert').removeClass('alert-info alert-success');
            this.$el.find('#private-area').addClass('alert-warning');
            this.model.set('type', 'private');
        },

    });
});