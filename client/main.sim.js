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
$(document).bind('keydown', function (e) {
  if (e.keyCode > 48 /* 0 */ && e.keyCode <= 57 /* 9 */) {
    revs += e.keyCode - 48;
  } else if (e.keyCode >= 65 /* a */ && e.keyCode <= 70 /* f */) {
    revs += e.keyCode - 65 + 10;
  }

  if (revs === 0) return;

  var dist = revs * c();
  revs = 0;
  Session.set('distance', Session.get('distance') + dist);
  window.traveled += localStorage['multiplier'] * dist;

  if (window.traveled >= window.point.distance) {
    var next = Points.findOne({_id: window.point.next});

    // Go to next point, if one exists
    if (next) {
      window.traveled -= localStorage['multiplier'] * next.distance;

      maps.travel(next._id, {route: true});
      window.point = next;
    }
  }
});

var speed_buffer = createRingBuffer(5 * 2);

var prev = 0;
function speedo() {
  speed_buffer.push(Session.get('distance') - prev);
  prev = Session.get('distance') || 0;

  Session.set('speed', speed_buffer.sum() / 5.0);
}

setInterval(speedo, 500);

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

window.init_sim = function init_sim() {

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

};
