Routes = new Meteor.Collection('routes');
Points = new Meteor.Collection('points');

Routes.allow({
  insert: function (userId, doc) {
    // logged in + owner of route
    return (userId && doc.owner === userId);
  },
  update: function (userId, docs, fields, modifier) {
    return _.all(docs, function (doc) {
      return doc.owner === userId;
    });
  },
  remove: function (userId, docs) {
    return _.all(docs, function (doc) {
      return doc.owner === userId;
    });
  },
  fetch: ['owner']
});

Points.allow({
  insert: function (userId, doc) {
    var route = Routes.findOne({_id: doc.route});
    return (userId && route && route.owner === userId);
  },
  update: function (userId, docs, fields, modifier) {
    return _.all(docs, function (doc) {
      var route = Routes.findOne({_id: doc.route});
      return (route && route.owner === userId);
    });
  },
  remove: function (userId, docs) {
    return _.all(docs, function (doc) {
      var route = Routes.findOne({_id: doc.route});
      return (route && route.owner === userId);
    });
  },
  fetch: ['route']
});
