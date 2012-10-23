window.point = null;
window.traveled = 0;

var createRingBuffer = function (length){
  var pointer = 0, buffer = [], sum = 0;

  return {
    push: function (item) {
      if (buffer[pointer] > 0) {
        sum -= buffer[pointer];
        if (sum <= 0) sum = 0;
      }
      buffer[pointer] = item;
      sum += item;
      pointer = (length + pointer + 1) % length;
    },
    sum: function () {
      return sum;
    }
  };
};

var revs = 0;
$(document).bind('keydown.space', function () {
  revs += 1;

  var dist = localStorage['multiplier'] * c();
  Session.set('distance', Session.get('distance') + dist);
  window.traveled += dist;

  if (window.traveled >= window.point.distance) {
    var next = Points.findOne({_id: window.point.next});

    // Go to next point, if one exists
    if (next) {
      window.traveled -= next.distance;

      maps.travel(next._id, {route: true});
      window.point = next;
    }
  }
});

// function speedo() {
//   speed_buffer.push(revs * c());
//   revs = 0;

//   Session.set('speed', speed_buffer.sum() / 5);
// }

// setInterval(speedo, 500);

// 5sec, 2 values / sec.
var speed_buffer = createRingBuffer(5 * 2);
var speed_sum = 0;
var speed_avg = 0;

Template.sim.speed = function () {
  return Session.get('speed');
};

Template.sim.distance = function () {
  return Session.get('distance');
};

Template.sim.helpers({
  kmh: function (ms) {
    return (ms * 60 * 60 / 1000).toFixed(1);
  },
  km: function (m) {
    return (m / 1000).toFixed(2);
  }
});

var sock = new SockJS("http://localhost:9999/speed");

function init_sim() {


sock.onopen = function() {
  console.log('open');
};

sock.onmessage = function(e) {
  if (Session.equals('page', 'sim') && window.point) {
    debug('message', e.data);

    var dist = parseInt(e.data, 10) * c();
    speed_buffer.push(dist);

    Session.set('speed', speed_buffer.sum() / 5);

    Session.set('distance', Session.get('distance') + 3 * dist);
    window.traveled += 3 * dist;

    if (window.traveled >= window.point.distance) {
      var next = Points.findOne({_id: window.point.next});

      // Stay on current point if no next point exists
      if (next) {
        window.traveled -= next.distance;

        maps.travel(next._id, {route: true});
        zoom = 1;
        zoom_target = 1;
        window.point = next;
      }
    }
  }

};

sock.onclose = function() {
  console.log('close');
};

Meteor.autosubscribe(function () {
  if (Session.equals('page', 'sim')) {
    var route = Routes.findOne({_id: Session.get('route')});
    if (route) {
      Session.set('distance', 0);
      Session.set('speed', 0);
      window.traveled = 0;
      maps.lines.traveled.clear();
      maps.lines.route.clear();

      // Siirytään reitin alkuun
      window.point = Points.findOne({_id: route.first});
      maps.travel(route.first, {route: true});

      // Show full route on map
      var p = window.point;
      while (p !== undefined) {
        maps.lines.route.add(p.latlng);
        p = Points.findOne({_id: p.next});
      }
    }
  }
});

}
