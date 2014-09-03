define([
    'text!common/template/job/item.html',
    'text!common/template/people/popover.html',
    'common/collection/base',
    'common/view/job/collection/languages',
    'common/view/job/collection/skills',
    'common/view/job/item/languages',
    'common/view/job/item/skills',
    'common/view/job/item/matches',
    'common/view/job/edit'
], function(
    template,
    popoverTemplate,
    BaseCollection,
    Languages,
    Skills,
    LanguagesView,
    SkillsView,
    MatchesView,
    EditView
) {

    return Backbone.Marionette.LayoutView.extend({

        // template
        template: template,

        // className
        className: 'isotope-item col-xs-12 col-sm-6 col-lg-4',

        // ui
        ui: {
            avatar: '.avatar',

            menuToggler: '.widget-header .widget-toolbar',
            editBtn: '.btn-edit',
            removeBtn: '.btn-remove',

            alert: '.alert',
            cancelBtn: '.btn-remove-cancel',
            confirmBtn: '.btn-remove-confirm',

            bookmarkBtn: '.btn-bookmark'
        },

        // event
        events: {
            'mouseover': 'toggleMenuIndicator',
            'mouseout': 'toggleMenuIndicator',

            'click @ui.avatar': 'toProfile',

            'click @ui.editBtn': 'editJob',
            'click @ui.removeBtn': 'showAlert',
            'click @ui.cancelBtn': 'hideAlert',
            'click @ui.confirmBtn': 'onRemove',

            'click @ui.bookmarkBtn': 'onBookmark',

            'click .btn-match': 'onMatch',
        },

        // modelEvent
        modelEvents: {
            'change': 'onMatch',
            'change:name': 'renderName',
            'change:expiredDate': 'renderExpired',
            'change:startDate': 'renderDuration',
            'change:endDate': 'renderDuration',
            'change:priceTop': 'renderPrice',
            'change:priceBottom': 'renderPrice',
            'change:address': 'renderAddress',
            'change:remark': 'renderRemark',
            'change:foreignerAllowed': 'renderForeigner',
            'change:recruitNum': 'renderRecruit',
            'change:interviewNum': 'renderInterview',
            'change:languages': 'renderLanguages',
            'change:skills': 'renderSkills',
            'change:bookmarked': 'renderBookmark',
        },

        // regions
        regions: {
            'languageArea': '.language',
            'skillArea': '.skill',
            'matchingArea': '.matching'
        },

        // initializer
        initialize: function() {

            // create language view
            this.languagesView = new LanguagesView({
                collection: new Languages(this.model.get('languages'))
            });

            // create skill view
            this.skillsView = new SkillsView({
                collection: new Skills(this.model.get('skills'))
            });
        },

        // after render
        onRender: function() {

            // add popover on job creator photo
            this.ui.avatar.popover({
                html: true,
                trigger: 'hover',
                container: 'body',
                placement: 'auto right',
                title: '<img src="' + this.model.get('_owner').cover + '" />',
                content: _.template(popoverTemplate, this.model.get('_owner')),
            });

            // add tooltip on bookmark button
            this.ui.bookmarkBtn.tooltip({
                placement: 'top',
                title: "ブックマーク"
            });
        },

        // after show
        onShow: function() {
            // show language area
            this.languageArea.show(this.languagesView);
            // show skill area
            this.skillArea.show(this.skillsView);

            if (this.model.get('isMine'))
                this.onMatch();
        },

        // show operation menu indicator
        toggleMenuIndicator: function() {
            this.ui.menuToggler.toggleClass('hidden');
        },

        // turn to user profile page
        toProfile: function(e) {

            // stop defautl link behavior
            e.preventDefault();

            // destroy the popover on user's photo
            this.ui.avatar.popover('destroy');
            // turn the page manually
            window.location = '#profile/' + this.model.get('_owner')._id;
        },

        // edit job
        editJob: function(e) {

            // stop defautl event behavior
            e.preventDefault();

            // create edit dialog with this view's model
            var jobEditView = new EditView({
                model: this.model
            });

            // show edit dialog
            selink.modalArea.show(jobEditView);
            selink.modalArea.$el.modal('show');
        },

        // show alert after delete link clicked
        showAlert: function(e) {

            // stop defautl event behavior
            e.preventDefault();

            var self = this;

            // show alert
            this.ui.alert.slideDown('fast', function() {
                    self.trigger("ensureLayout");
                })
                .find('i')
                .addClass('icon-animated-vertical');
        },

        // hide alert if user canceled the delete
        hideAlert: function() {

            var self = this;

            this.ui.alert.slideUp('fast', function() {
                self.trigger("ensureLayout");
            });
        },

        // remove job
        onRemove: function() {
            this.trigger('remove');
        },

        // Bookmark this posts
        onBookmark: function() {

            this.model.save({
                bookmarked: selink.user.get('_id') // TODO: no need to pass this parameter
            }, {
                url: '/jobs/' + this.model.get('_id') + '/bookmark',
                reIsotope: false, // do not re-isotope whole collection, that will cause image flicker
                patch: true,
                wait: true
            });
        },

        onMatch: function() {

            var self = this;

            $.ajax({
                type: 'GET',
                url: '/jobs/' + this.model.get('_id') + '/match',
                dataType: 'json',
                success: function(data) {

                    // sort matching result by score desc
                    data = _.sortBy(data, function(d){
                        return -d.score;
                    });

                    // create match view
                    self.matchesView = new MatchesView({
                        collection: new BaseCollection(data)
                    });

                    // show language view
                    self.matchingArea.show(self.matchesView);

                    self.trigger("ensureLayout");
                }
            });
        },

        // rerender bookmark icon
        renderBookmark: function() {

            // flip the icon and mark this post as bookmark
            this.ui.bookmarkBtn
                .find('i')
                .removeClass('fa-star-o')
                .addClass('fa-star')
                .slAnimated('flip');
            // remove bookmark button, can't bookmark it twice
            this.ui.bookmarkBtn.removeClass('btn-bookmark');
        },

        // rerender job name
        renderName: function(model, value, options) {
            this.$el.find('.name-value').empty().text(value);
        },

        // rerender expired date
        renderExpired: function(model, value, options) {
            this.$el.find('.expired-value').empty().text(moment(value).calendar());

            // make the wedget header grep if this job is expired
            if (moment(value).isBefore(moment()))
                this.$el.find('.widget-header').addClass('header-color-grey');
            else
                this.$el.find('.widget-header').removeClass('header-color-grey');
        },

        // rerender work duration
        renderDuration: function(model, value, options) {

            var $duration = this.$el.find('.duration-value'),
                startDate = model.get('startDate'),
                endDate = model.get('endDate');

            if (startDate && endDate)
                value = moment(startDate).format('L') + '～' + moment(endDate).format('L');
            else if (startDate && !endDate)
                value = moment(startDate).format('L') + '～';
            else if (!startDate && endDate)
                value = '～' + moment(endDate).format('L');
            else
                value = '';

            if (_.str.isBlank(value))
                $duration.empty().parent().addClass('hide');
            else
                $duration.empty().text(value).parent().removeClass('hide');
        },

        // rerender price
        renderPrice: function(model, value, options) {

            var $price = this.$el.find('.price-value'),
                priceBottom = model.get('priceBottom'),
                priceTop = model.get('priceTop');

            if (priceBottom && priceTop)
                value = priceBottom + '～' + priceTop + '万円';
            else if (priceBottom && !priceTop)
                value = priceBottom + '万円～';
            else if (!priceBottom && priceTop)
                value = '～' + priceTop + '万円';
            else
                value = '';

            if (_.str.isBlank(value))
                $price.empty().parent().addClass('hide');
            else
                $price.empty().text(value).parent().removeClass('hide');
        },

        // rerender work place
        renderAddress: function(model, value, options) {

            var $address = this.$el.find('.address-value');

            if (_.str.isBlank(value))
                $address.empty().parent().addClass('hide');
            else
                $address.empty().text(value).parent().removeClass('hide');
        },

        // rerender job introduction
        renderRemark: function(model, value, options) {
            this.$el.find('.remark-value').empty().html(value);
        },

        // rerender foreigner allowed flag
        renderForeigner: function(model, value, options) {

            var $foreigner = this.$el.find('.foreigner-value');

            if (model.get('foreignerAllowed'))
                $foreigner.addClass('hide');
            else
                $foreigner.removeClass('hide');
        },

        // rerender recruit number
        renderRecruit: function(model, value, options) {

            var $recruit = this.$el.find('.recruit-value');

            if (_.str.isBlank(value) || value == 0)
                $recruit.empty().addClass('hide');
            else
                $recruit.empty().text('募集' + value + '人').removeClass('hide');
        },

        // rerender interview number
        renderInterview: function(model, value, options) {

            var $interview = this.$el.find('.interview-value');

            if (_.str.isBlank(value) || value == 0)
                $interview.empty().addClass('hide');
            else
                $interview.empty().text('面接' + value + '回').removeClass('hide');
        },

        // rerender language requirement
        renderLanguages: function(model, value, options) {

            // create language area
            this.languagesView = new LanguagesView({
                collection: new Languages(this.model.get('languages'))
            });

            // show language area
            this.languageArea.show(this.languagesView);
        },

        // rerender skill requirement
        renderSkills: function(model, value, options) {

            // create skill area
            this.skillsView = new SkillsView({
                collection: new Skills(this.model.get('skills'))
            });

            // show skill area
            this.skillArea.show(this.skillsView);
        }
    });
});