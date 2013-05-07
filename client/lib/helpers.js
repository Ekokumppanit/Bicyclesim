helpers = {
  round: function (num, dig) {
    return parseFloat(num).toFixed(dig);
  },
  lat: function (latlng) {
    return latlng[0].toFixed(5);
  },
  lng: function (latlng) {
    return latlng[1].toFixed(5);
  }
};

activateInput = function (input) {
  input.focus();
  input.select();
};

okCancelEvents = function (selector, callbacks) {
  var ok = callbacks.ok || function () {};
  var cancel = callbacks.cancel || function () {};

  var events = {};
  events['keyup '+selector+', keydown '+selector+', focusout '+selector] =
    function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  return events;
};
