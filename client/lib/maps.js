function maps_loaded() {

window.markers = []; // fuu

var Maps = function () {
  function glatlng(latlng) {
    return new google.maps.LatLng(latlng[0], latlng[1]);
  }

  var Line = function (attr) {
    attr = attr || {};

    var data = new google.maps.Polyline(attr);

    return {
      clear: function () {
        data.setPath([]);
      },
      add: function (latlng) {
        data.getPath().push(glatlng(latlng));
      }
    };
  };

  var Markers = function (map) {
    var data = [];

    return {
      clear: function () {
        for (var i = data.length - 1; i >= 0; --i) {
          data[i].setMap(null);
        }
        data.length = 0;
      },
      add: function (latlng, arg) {
        var attr = {
          map: map,
          position: glatlng(latlng)
        };

        if (arg.type == 'icon') {
          attr['icon'] = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + arg.text + '|FF0000|000000';
        }

        data.push(new google.maps.Marker(attr));
      }
    };
  };

  var Listeners = function (instances) {
    var handles = {};

    return {
      add: function (id, instance, event, cb) {
        if (_.has(handles, id)) {
          google.maps.event.removeListener(handles[id]);
        }
        handles[id] = google.maps.event.addListener(instances[instance], event, cb);
      },
      remove: function (id) {
        google.maps.event.removeListener(handles[id]);
      }
    };
  };

  var street = new google.maps.StreetViewPanorama(document.getElementById("street"), {
    position: glatlng(settings.default_latlng),
    pov: settings.default_pov,
    panControl: false,
    imageDateControl: false,
    scrollwheel: false,
    zoomControl: false,
    addressControl: false
  });

  var map = new google.maps.Map(document.getElementById("map"), {
    center: glatlng(settings.default_latlng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoom: 15,
    mapTypeControl: false,
    draggable: false,
    streetView: street,
    streetViewControl: false,
    scrollwheel: false,
    zoomControl: false
  });
  window.map = map;

  var bicycling = new google.maps.BicyclingLayer();
  bicycling.setMap(map);

  var lines = {
    'route': new Line({
      map: map,
      strokeColor: '#51B5FF'
    }),
    'traveled': new Line({
      map: map
    })
  };

  var markers = new Markers(map);

  var listeners = new Listeners({
    map: map,
    street: street
  });

  return {
    lines: lines,
    markers: markers,
    listeners: listeners,
    getLatLng: function () {
      return [street.getPosition().lat(), street.getPosition().lng()];
    },
    mode: function (mode) {
      if (mode == 'edit') {
        map.setOptions({
          scrollwheel: true,
          draggable: true,
          streetViewControl: true
        });
        street.setOptions({
          clickToGo: true,
          linksControl: true
        });
      } else if (mode == 'sim') {
        map.setOptions({
          scrollwheel: false,
          draggable: false,
          streetViewControl: false
        });
        street.setOptions({
          clickToGo: false,
          linksControl: false
        });
      }
    },
    default_pos: function () {
      street.setPosition(glatlng(settings.default_latlng));
      street.setPov(settings.default_pov);
    },
    /*
     * Travel to a location.
     * Updates streetview.
     * Optionally centers the map.
     */
    travel: function (point_id, arg) {
      arg = arg || {};
      _.defaults(arg, {
        route: false
      });

      var point = Points.findOne({_id: point_id});
      if (point) {
          street.setPosition(glatlng(point.latlng));
        map.setCenter(glatlng(point.latlng));

        if (point.heading) street.setPov({zoom: 1, pitch: 0, heading: point.heading});
        if (arg.route) lines.traveled.add(point.latlng);
      }
    }
  };
};

$(document).ready(function () {
  window.maps = new Maps();
  init_main();
  init_sim();
  init_edit();
});

}

window.onload = function () {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.googleapis.com/maps/api/js?key=" + settings.maps_key + "&sensor=false&callback=maps_loaded";
  document.body.appendChild(script);
};
