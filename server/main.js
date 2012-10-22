
function update_route(route_id) {
  var path = [];
  var route = Routes.findOne({_id: route_id});
  var len = 0;
  if (route) {
    var point = Points.findOne({_id: route.first});
    var next = null;
    var heading = 0;
    while (point !== undefined) {
      path.push(point.latlng);

      next = Points.findOne({_id: point.next});

      var distance = 0;
      // Uses previous heading if no next point
      if (next) {
        heading = computeFinalBearing(point.latlng, next.latlng);
        distance = computeDistance(point.latlng, next.latlng);
      }

      len += distance;
      Points.update({_id: point._id}, {$set: {
        heading: heading,
        distance: distance
      }});

      point = next;
    }
  }

  Routes.update({_id: route_id}, {$set: {
    path: createEncodedPolyline(path),
    route_length: len
  }});
}


Meteor.methods({
  insert_point: function (latlng, route_id) {
    var route = Routes.findOne({_id: route_id});
    if (!route) return;

    var point_id = Points.insert({latlng: latlng, route: route_id, distance: 0, next: null});

    // Add new point after last point.
    Points.update({route: route_id, next: null, _id: {$ne: point_id}}, {$set: {next: point_id}});

    // If route didn't have any point, update first point,
    Routes.update({_id: route_id, first: null}, {$set: {first: point_id}});

    update_route(route_id);
  },
  remove_point: function (point_id) {
    var point = Points.findOne({_id: point_id});
    // Update previous point to point to point after removed one
    Points.update({next: point._id}, {$set: {next: point.next}});

    // Point was first of route, update routes first to removed points next.
    Routes.update({first: point._id}, {$set: {first: point.next}});

    Points.remove({_id: point_id});

    update_route(point.route);
  }
});
