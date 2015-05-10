var NotificationManager = function(scope) {

  // notification queue
  scope.notifications = [];  // WARN:  Don't change this variable name, it's coupled to scope and outside of this function.

  // remove processed notifications
  this.sweepNotifications = function () {

    for (var i=0; i < scope.notifications.length; i++) {
      if(scope.notifications[i].processed == true) {
        scope.notifications = scope.notifications.splice(i, 0);
        i = i + 1;
        continue;
      }
    }

  }

  // add notification to model
  this.notify = function(type, text) {

    // convenient place to say "while we're
    // here, clear all processed notifications
    // from the model
    this.sweepNotifications();

    // push notifications onto scope to be observed by directive
    scope.notifications.push({"type": type, "text": text});
  }

}
