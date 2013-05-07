// --- Body classes ---
Meteor.autosubscribe(function () {
  if (Session.equals('page', 'edit')) {
    $("body").addClass('show-sidebar');
  } else {
    $("body").removeClass('show-sidebar');
  }

  if (Session.equals('page', 'sim') || Session.equals('page', 'edit')) {
    $("body").addClass('show-map');
  } else {
    $("body").removeClass('show-map');
  }
});

$(document).ready(function () {
  if (Session.equals('page', 'edit')) {
    $("body").addClass('show-sidebar');
  }

  if (Session.equals('page', 'sim') || Session.equals('page', 'edit')) {
    $("body").addClass('show-map');
  }
});

// --- Main ---

Template.main.frontpage = function () {
  return Session.equals('page', 'frontpage');
};

Template.main.frontpage_edit = function () {
  return Session.equals('page', 'frontpage_edit');
};

Template.main.editing = function () {
  if (Session.equals('page', 'edit')) {
    return Routes.findOne({_id: Session.get('route')});
  }
  return false;
};

Template.main.help = function () {
  return Session.equals('page', 'help');
};

Template.main.settings = function () {
  return Session.equals('page', 'settings');
};

Template.main.sim = function () {
  if (Session.equals('page', 'sim')) {
    return Routes.findOne({_id: Session.get('route')});
  }
  return false;
};

// --- Frontpage ---

Template.frontpage.routes = function () {
  return Routes.find();
};

Template.frontpage.editing = function () {
  return Session.equals('page', 'frontpage_edit');
};

Template.frontpage.staticmap = function () {
  return 'http://maps.googleapis.com/maps/api/staticmap?path=enc:' + this.path + '&size=360x270&key=' + settings.staticmaps_key + '&sensor=false';
};

Template.frontpage.helpers({
  'km': function (m) {
    return (m / 1000).toFixed(2);
  }
});

// --- Settings ---
Template.settings.settings = function () {
  return localStorage;
};

Template.settings.events({
  'change #settings_multiplier': function (event) {
    localStorage.setItem('multiplier', parseFloat(event.target.value));
  }
});

// --- Keybinds ---

$(document).bind('keydown.esc', function () {
  Router.navigate('/', {trigger: true});
});

// --- Routes ---

$(document).on("click", "a[href^='/']", function (event) {
  var href = $(event.currentTarget).attr('href');

  // chain 'or's for other black list routes
  var passThrough = href.indexOf('sign_out') >= 0;

  // Allow shift+click for new tabs, etc.
  if (!passThrough && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();

    // Remove leading slashes and hash bangs (backward compatablility)
    var url = href.replace('/^\//', '').replace('#!', '');

    // Instruct Backbone to trigger routing events
    Router.navigate(url, {trigger: true});

    return false;
  }
});

var RoutesRouter = Backbone.Router.extend({
  routes: {
    "": "index",
    "help": "help",
    "settings": "settings",
    "edit": "index_edit",
    ":route_id": "sim",
    "edit/:route_id": "edit"
  },
  index: function () {
    debug('frontpage');
    Session.set('page', 'frontpage');
    Session.set('route', null);
  },
  help: function () {
    debug('frontpage');
    Session.set('page', 'help');
    Session.set('route', null);
  },
  settings: function () {
    debug('frontpage');
    Session.set('page', 'settings');
    Session.set('route', null);
  },
  index_edit: function () {
    debug('frontpage edit');
    Session.set('page', 'frontpage_edit');
    Session.set('route', null);
  },
  sim: function (route_id) {
    debug('simulation, route: ' + route_id);
    Session.set('page', 'sim');
    Session.set('route', route_id);
  },
  edit: function (route_id) {
    debug('edit, route: ' + route_id);
    Session.set('page', 'edit');
    Session.set('route', route_id);
  }
});

Router = new RoutesRouter();

Meteor.startup(function () {
  Backbone.history.start({pushState: true});
});

window.init_main = function init_main() {
  Meteor.autosubscribe(function () {
    // When changing page

    maps.markers.clear();
    maps.lines.traveled.clear();
    maps.lines.route.clear();

    if (Session.equals('page', 'frontpage') || Session.equals('page', 'frontpage_edit')) {
      maps.default_pos();
    }

    if (Session.equals('page', 'edit')) {
      maps.mode('edit');
    } else {
      maps.mode('sim');
    }
  });
};
