Session.set('points-autoadd', false);
var full_clear_required = true;

function add_point(latlng, num, trigger) {
  maps.lines.route.add(latlng);
  maps.markers.add(latlng, {type: 'icon', text: num});
}

var num = 1;
function new_point(latlng) {
  Meteor.call('insert_point', latlng, Session.get('route'), function () {
    add_point(latlng, num, true);
    ++num;
    $('.sidebar').animate({scrollTop: $('.sidebar-inner').height()}, 'fast');
    Session.set('saved', false);
  });
}

// --- Route management ---

Template.frontpage.editing_route_name = function () {
  return Session.equals('editing_route_name', this._id);
};

Template.frontpage.can_edit = function () {
  var route = Routes.findOne({_id: this._id});
  return (route && Meteor.user() && route.owner === Meteor.user()._id);
};

Template.frontpage.logged_in = function () {
  return Meteor.user();
};

Template.frontpage.events({
  'click div.thumbnail img': function (event, template) {
    Router.navigate('/edit/' + this._id, {trigger: true});
  },
  'click a.remove': function () {
    Points.remove({route: this._id});
    Routes.remove({_id: this._id});
  },
  'dblclick div.thumbnail span': function (event, template) {
    if (Meteor.user() && this.owner === Meteor.user()._id) {
      Session.set('editing_route_name', this._id);
      Meteor.flush();
      activateInput(template.find('#route-name'));
    }
  }
});

Template.frontpage.events(
  okCancelEvents('#new-route', {
    ok: function (text, event) {
      Routes.insert({owner: Meteor.user()._id, name: text, first: null});
      event.target.value = "";
    }
  })
);

Template.frontpage.events(
  okCancelEvents('#route-name', {
    ok: function (text) {
      Routes.update({_id: this._id}, {$set: {name: text}});
      Session.set('editing_route_name', null);
    },
    cancel: function () {
      Session.set('editing_route_name', null);
    }
  })
);

// --- Points ---

Template.points.points = function () {
    var points = [];
    var route = Routes.findOne({_id: Session.get('route')});
    if (route) {
      var point = Points.findOne({_id: route.first});
      while (point !== undefined) {
        points.push(point);
        point = Points.findOne({_id: point.next});
      }
    }
    return points;
};

Template.points.autoadd = function () {
  return Session.get('points-autoadd');
};

Template.points.can_edit = function () {
  var route = Routes.findOne({_id: Session.get('route')});
  return (route && Meteor.user() && route.owner === Meteor.user()._id);
};

Template.points.saved = function () {
  return Session.get('saved');
};

Template.points.helpers(helpers);

Template.points.events({
  'click li.point': function () {
    maps.travel(this._id, {center: true});
  },
  'click a.remove': function () {
    Meteor.call('remove_point', this._id, function () {
      full_clear_required = true;
      Session.set('saved', false);
    });
  },
  'click .new-point': function () {
    new_point(maps.getLatLng());
  },
  'click .save': function () {
    Meteor.call('update_route', Session.get('route'), function () {
      Session.set('saved', true);
    });
  },
  'change #points-autoadd': function (event) {
    Session.set('points-autoadd', event.currentTarget.checked);
  }
});

Template.editing.owner = function () {
  var route = Routes.findOne({_id: Session.get('route')});
  var user = Meteor.users.findOne({_id: route.owner});
  if (!user) return;
  return user.profile.name;
};

window.init_edit = function init_edit() {

Meteor.autorun(function () {
  if (Session.equals('page', 'edit') && Session.get('route')) {
    debug('sivu tai route vaihtui, route: ' + Session.get('route'));
    full_clear_required = true;
    Session.set('saved', true);

    Deps.nonreactive(function () {
      var route = Routes.findOne({_id: Session.get('route')});
      if (route) {
        maps.travel(route.first, {route: true});
      } else {
        maps.default_pos();
      }
    });
  }
});

Meteor.autosubscribe(function () {
  Session.set('points-autoadd', false);

  if (Session.equals('page', 'edit') && Session.get('route')) {
    if (full_clear_required) {
      Deps.nonreactive(function () {
        debug('full clear');

        maps.lines.route.clear();
        maps.markers.clear();
        num = 1;

        var route = Routes.findOne({_id: Session.get('route')});
        if (route) {
          var point = Points.findOne({_id: route.first});
          while (point !== undefined) {
            add_point(point.latlng, num, false);

            point = Points.findOne({_id: point.next});
            ++num;
          }
          full_clear_required = false;
        }
      });
    }
  }
});

function autoadd_listener() {
  var route = Routes.findOne({_id: Session.get('route')});
  if (Session.get('points-autoadd') && route && Meteor.user() && Meteor.user()._id === route.owner) {
    var latlng = maps.getLatLng();

    // Do not add duplicate points.
    if (Points.findOne({route: route._id, latlng: latlng}) !== undefined) return;

    new_point(latlng);
  }
}

window.autoadd_listener = null;
Meteor.autosubscribe(function () {
  if (Session.get('points-autoadd')) {
    maps.listeners.add('points-autoadd', 'street', 'position_changed', autoadd_listener);
  } else {
    maps.listeners.remove('points-autoadd');
  }
});

}
