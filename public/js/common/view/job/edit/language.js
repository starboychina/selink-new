define([
    'common/view/item-base',
    'text!common/template/profile/language.html'
], function(
    BaseView,
    template) {

    // the dropdown list
    var languageList = ["日本語","英語","中国語","韓国語","ヒンディー語","スペイン語","ロシア語","フランス語","アラビア語","ポルトガル語","マレー語","ベンガル語","ドイツ語","ウルドゥー語","イタリア語","ベトナム語","ペルシア語","タガログ語","タイ語","トルコ語"];

    return BaseView.extend({

        // template
        template: template,

        // class name
        className: 'grid3 center sl-editable',

        // initializer
        initialize: function() {

            // put the dropdown list to model silently
            this.model.set('languageList', languageList, {silent: true});

            this.ui = _.extend({}, this.ui, {
                'input': 'select',
                'remove': '.btn-remove'
            });

            this.events = _.extend({}, this.events, {
                'change select': 'updateModel',
                'click .btn-remove': 'removeModel'
            });

            // listen to the knob input
            this.listenTo(this, 'knob', this.updateModel);
        },

        // after render
        onRender: function() {

            var self = this;

            // set up knob
            this.$el.find('.knob').knob({

                // custom draw
                'draw': function() {

                    // change label
                    $(this.i).val(this.cv + 'pt');

                    // change color by value
                    if (this.cv > 85)
                        this.fgColor = '#59a84b';
                    else if (this.cv > 70)
                        this.fgColor = '#2a91d8';
                    else if (this.cv > 50)
                        this.fgColor = '#f2bb46';
                    else if (this.cv > 30)
                        this.fgColor = '#ca5952';
                    else
                        this.fgColor = '#9585bf';

                    // below are copied from default knob
                    var c = this.g,                 // context
                        a = this.angle(this.cv),    // Angle
                        sat = this.startAngle,     // Start angle
                        eat = sat + a;             // End angle

                    c.lineWidth = 10;//this.lineWidth;

                    this.o.cursor
                        && (sat = eat - this.cursorExt)
                        && (eat = eat + this.cursorExt);

                    c.beginPath();
                        c.strokeStyle = this.o.bgColor;
                        c.arc(this.xy, this.xy, this.radius, this.endAngle, this.startAngle, true);
                    c.stroke();

                    c.beginPath();
                        c.strokeStyle = this.fgColor ;
                        c.arc(this.xy, this.xy, this.radius, sat, eat, false);
                    c.stroke();

                    this.i.css('color', this.fgColor);

                    return false;
                },
                'release': function(value) {
                    // put the value to view
                    self.weight = value;
                    // let the view know the knob was moved
                    self.trigger('knob');
                }
            });

            // enable chosen
            this.$el.find('select').chosen({
                width: "100%",
                disable_search_threshold: 100
            });
        },

        // remove model
        updateModel: function() {

            // set value on model
            this.model.set({
                'language': this.ui.input.val(),
                'weight': this.weight
            });
            // render view with new value
            this.render();
        },

        // remove model
        removeModel: function() {

            var self = this;

            // hide view first
            this.$el.slAnimated('bounceOut', '', function(){
                $(this).removeClass('animated bounceOut');
                // remove model
                self.model.collection.remove(self.model);
            });
        }

    });
});