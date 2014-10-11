'use strict';

eventsApp.factory('authService', function () {
    var currentUser = {};

    function cloneObject(object) {
        return JSON.parse(JSON.stringify(object));
    };

    return {
        getCurrentUserName:function () {
            return currentUser.format('%s %s', currentUser.firstName, currentUser.lastName);
        },
        getCurrentUser:function () {
            return cloneObject(currentUser);
        },
        setCurrentUser:function (user) {
            currentUser = cloneObject(user);
        },
        isAuthenticated:function() {
            return !!currentUser && !!currentUser.email;
        }
    };
})