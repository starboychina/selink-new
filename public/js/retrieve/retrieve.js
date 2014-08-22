define([
    'retrieve/view/reset'
], function(
    ResetPasswordView
) {

    // create application instance
    window.selink = new Backbone.Marionette.Application();

    // initialize application
    selink.addInitializer(function(options) {
        new ResetPasswordView({
            el: '.forgot-box'
        });
    });

    return selink;
});