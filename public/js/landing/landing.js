define([
    'landing/view/signin',
    'landing/view/signup'
], function(
    SignInView,
    SignUpView
) {

    // create application instance
    window.selink = new Backbone.Marionette.Application();

    // create regions
    selink.addRegions({
        signInArea: '#sign-in-area',
        signUpArea: '#sign-up-area',
        modalArea: '#modal-area'
    });

    // initialize application
    selink.addInitializer(function(options) {

        // THIS IS VITAL, change the default behavior of views load template,
        // or the underscore template won't work
        Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId) {

            var template = templateId;

            if (!template || template.length === 0) {
                var msg = "Could not find template: '" + templateId + "'";
                var err = new Error(msg);
                err.name = "NoTemplateError";
                throw err;
            }
            return template;
        };

        // switch page with fade effect
        Backbone.Marionette.Region.prototype.open = function(view){
            this.$el.hide();
            this.$el.html(view.el);
            this.$el.fadeIn();
        };

        var signInView = new SignInView();
        this.signInArea.show(signInView);

        var signUpView = new SignUpView();
        this.signUpArea.show(signUpView);

        $.scrollIt({
            topOffset: 50
        });
    });

    return selink;
});