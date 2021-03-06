window.settings = {
  'default_latlng': [61.501043, 23.763035],
  'default_pov': {
    heading: 200,
    pitch: 0,
    zoom: 1
  },
  'debug': false,
  'maps_key': 'AIzaSyDtGhiAnSdg9TaGZC_daNcQe43BS8Ws7Iw',
  'staticmaps_key': 'AIzaSyDtGhiAnSdg9TaGZC_daNcQe43BS8Ws7Iw'
};

window.c = function () {
  return Math.PI * localStorage.diameter * 2.54 / 100;
};

if (_.has(localStorage, 'diameter') && !_.isNumber(localStorage.diameter)) {
  delete localStorage.diameter;
}


if (_.has(localStorage, 'multiplier') && !_.isNumber(localStorage.multiplier)) {
  delete localStorage.multiplier;
}

_.defaults(localStorage, {
  diameter: 28,
  multiplier: 2.5
});

window.debug = function () {
  if (this.console && settings.debug) {
    console.log(Array.prototype.slice.call(arguments));
  }
};
