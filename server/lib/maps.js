/*
 * Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2012
 * From: http://www.movable-type.co.uk/scripts/latlong.html
 */

if (typeof Number.prototype.toRad == 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };
}

if (typeof Number.prototype.toDeg == 'undefined') {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  };
}

computeDistance = function computeDistance(from, to) {
  // Equirectangular approximation, should be enough as distances are small
  var R = 6371000; // km
  var x = (to[1].toRad() - from[1].toRad()) * Math.cos((from[0].toRad() + to[0].toRad()) / 2);
  var y = (from[0].toRad() - to[0].toRad());
  return Math.sqrt(x * x + y * y) * R;
};

function computeInitialBearing(from, to) {
  var dLat = (to[0] - from[0]).toRad();
  var dLon = (to[1] - from[1]).toRad();
  var lat1 = from[0].toRad();
  var lat2 = to[0].toRad();

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x).toDeg() + 360) % 360;
}

computeFinalBearing = function computeFinalBearing(from, to) {
  return (computeInitialBearing(to, from) + 180) % 360;
};

// Rest are copied from: https://github.com/moshen/node-googlemaps/blob/master/lib/googlemaps.js
createEncodedPolyline = function createEncodedPolyline(points) {
  // Dear maintainer:
  //
  // Once you are done trying to 'optimize' this routine,
  // and have realized what a terrible mistake that was,
  // please increment the following counter as a warning
  // to the next guy:
  //
  // total_hours_wasted_here = 11
  //
  var i, dlat, dlng;
  var plat = 0;
  var plng = 0;
  var encoded_points = "";
  if(typeof points === 'string'){
    points = points.split('|');
  }

  for(i = 0; i < points.length; i++) {
    var point = points[i];//.split(',');
    var lat = point[0];
    var lng = point[1];
    var late5 = Math.round(lat * 1e5);
    var lnge5 = Math.round(lng * 1e5);
    dlat = late5 - plat;
    dlng = lnge5 - plng;
    plat = late5;
    plng = lnge5;
    encoded_points += encodeSignedNumber(dlat) + encodeSignedNumber(dlng);
  }
  return encoded_points;
};

function encodeNumber(num) {
  var encodeString = "";
  var nextValue, finalValue;
  while (num >= 0x20) {
    nextValue = (0x20 | (num & 0x1f)) + 63;
    encodeString += (String.fromCharCode(nextValue));
    num >>= 5;
  }
  finalValue = num + 63;
  encodeString += (String.fromCharCode(finalValue));
  return encodeString;
}

function encodeSignedNumber(num) {
  var sgn_num = num << 1;
  if (num < 0) {
    sgn_num = ~(sgn_num);
  }
  return(encodeNumber(sgn_num));
}
