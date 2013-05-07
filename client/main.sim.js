window.point = null;
window.traveled = 0;

function move () {
  // var dist = localStorage['multiplier'] * c();
  var dist = localStorage['multiplier'] * 0.1 * Session.get('speed');
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
}

var line = '';
$(document).on('keydown', function (e) {
  if (e.keyCode === 13) { // enter
    if (line.length >= 1 && line[0] == 'S') {
      var speed = Number(line.slice(1));
      Session.set('speed', speed);
      $('.speedSlider').slider('value', speed);
    }
    line = '';
  } else {
    line += String.fromCharCode(e.keyCode);
  }
});

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

var i;
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

      i = setInterval(move, 100);
    }

    $('.speedSlider').slider({
      orientation: 'vertical',
      range: 'min',
      min: 0,
      max: 22.2, // m/s
      value: 0,
      slide: function (event, ui) {
        Session.set('speed', ui.value);
      }
    });
  } else {
    i = clearInterval(i);
  }
});

};
