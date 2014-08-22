define([
    'text!common/template/group/new/confirm.html'
],function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        template: template,

        tagName: 'dl',

        className: 'dl-horizontal text-primary bigger-110 col-xs-10 col-xs-offset-1 col-md-8 col-md-offset-2'

    });
});