define([
    'text!admin/template/data/solr/main.html'
], function(
    template
) {

    return Backbone.Marionette.ItemView.extend({

        // Template
        template: template,

        // Events
        events: {
            'click #user': 'indexUser',
            'click #group': 'indexGroup',
            'click #job': 'indexJob',
            'click #post': 'indexPost',
            'click #message': 'indexMessage',
            'click #announcement': 'indexAnnouncement',
            'click #tag': 'indexTag'
        },

        indexUser: function() {
            this.sendRequest('/solr/user');
        },

        indexGroup: function() {
            this.sendRequest('/solr/group');
        },

        indexJob: function() {
            this.sendRequest('/solr/job');
        },

        indexPost: function() {
            this.sendRequest('/solr/post');
        },

        indexMessage: function() {
            this.sendRequest('/solr/message');
        },

        indexAnnouncement: function() {
            this.sendRequest('/solr/announcement');
        },

        indexTag: function() {
            this.sendRequest('/solr/tag');
        },

        sendRequest: function(url) {
            $.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                success: function(data) {
                    $.gritter.add({
                        title: data.title,
                        text: data.text,
                        class_name: 'gritter-success'
                    });
                },
                error: function() {
                    $.gritter.add({
                        title: data.title,
                        text: data.text,
                        class_name: 'gritter-danger'
                    });
                }
            });
        }

    });

});