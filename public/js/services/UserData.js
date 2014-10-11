'use strict';

eventsApp.factory('userData', function ($resource) {
    var resource = $resource('/api/login/:email/with/:password', {email:'@email, password: @password'}, { });
    return {
        getUser: function(email, password, callback) {
            return resource.get({email: email, password: password},
                function (user) {
                    if (callback)
                        callback(user, true);
                },
                function (user) {
                    if (callback)
                        callback(user, false);
                });
        },
        save: function(user) {
            resource.save(user);
        },
        users: function () {
            return resource.query({}, function(users) {
                return users;
            });
        }
    };
});