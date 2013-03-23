(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.brunch = true;
})();

window.require.register("initialize", function(exports, require, module) {
  var _ref, _ref1, _ref2, _ref3, _ref4;

  if ((_ref = this.CSLE) == null) {
    this.CSLE = {};
  }

  if ((_ref1 = CSLE.Routers) == null) {
    CSLE.Routers = {};
  }

  if ((_ref2 = CSLE.Views) == null) {
    CSLE.Views = {};
  }

  if ((_ref3 = CSLE.Models) == null) {
    CSLE.Models = {};
  }

  if ((_ref4 = CSLE.Collections) == null) {
    CSLE.Collections = {};
  }

  $(function() {
    var AppView;

    CSLE.Views.AppView = new (AppView = require('views/app_view'));
    return Backbone.history.start({
      pushState: true
    });
  });
  
});
window.require.register("lib/collection", function(exports, require, module) {
  var Collection, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = Collection = (function(_super) {
    __extends(Collection, _super);

    function Collection() {
      _ref = Collection.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Collection.prototype.resetSilent = function(models) {
      return this.reset(models, {
        silent: true
      });
    };

    return Collection;

  })(Backbone.Collection);
  
});
window.require.register("lib/model", function(exports, require, module) {
  var Model, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  module.exports = Model = (function(_super) {
    __extends(Model, _super);

    function Model() {
      _ref = Model.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Model.prototype.setSilent = function(attributes) {
      return this.set(attributes, {
        silent: true
      });
    };

    Model.prototype.push = function() {
      var attr, attribute, obj, values;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      attr.push.apply(attr, values);
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.pop = function(attribute) {
      var attr, obj;

      obj = {};
      attr = this.get(attribute);
      attr.pop();
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.reverse = function(attribute) {
      var attr, obj;

      obj = {};
      attr = this.get(attribute);
      attr.reverse();
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.shift = function(attribute) {
      var attr, obj;

      obj = {};
      attr = this.get(attribute);
      attr.shift();
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.unshift = function() {
      var attr, attribute, obj, values;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      attr.unshift.apply(attr, values);
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.splice = function() {
      var attr, attribute, obj, values;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      attr.splice.apply(attr, values);
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.add = function() {
      var attr, attribute, obj, value, values, _i, _len;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        attr += value;
      }
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.subtract = function() {
      var attr, attribute, obj, value, values, _i, _len;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        attr -= value;
      }
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.divide = function() {
      var attr, attribute, obj, value, values, _i, _len;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        attr /= value;
      }
      obj[attribute] = attr;
      return this.set(obj);
    };

    Model.prototype.multiply = function() {
      var attr, attribute, obj, value, values, _i, _len;

      attribute = arguments[0], values = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      obj = {};
      attr = this.get(attribute);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        attr *= value;
      }
      obj[attribute] = attr;
      return this.set(obj);
    };

    return Model;

  })(Backbone.Model);
  
});
window.require.register("lib/view", function(exports, require, module) {
  var Model, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('lib/model');

  module.exports = View = (function(_super) {
    __extends(View, _super);

    function View() {
      _ref = View.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    View.prototype.debug = false;

    View.prototype.startDebugging = function() {
      this.on("" + this.cid + ":initialize", function() {
        return console.debug("Initialized " + this.name, this);
      });
      this.on("" + this.cid + ":render", function() {
        return console.debug("Rendered " + this.name, this);
      });
      this.on("" + this.cid + ":update", function() {
        return console.debug("Updated " + this.name, this);
      });
      return this.on("" + this.cid + ":destroy", function() {
        return console.debug("Destroyed " + this.name, this);
      });
    };

    View.prototype.type = 'view';

    View.prototype.name = null;

    View.prototype.autoRender = false;

    View.prototype.rendered = false;

    View.prototype.model = new Model();

    View.prototype.template = function() {
      return '';
    };

    View.prototype.html = function(dom) {
      this.$el.html(dom);
      this.trigger("" + this.cid + ":" + (this.rendered ? 'update' : 'render'), this);
      return this.$el;
    };

    View.prototype.append = function(dom) {
      this.$el.append(dom);
      this.trigger("" + this.cid + ":" + (this.rendered ? 'update' : 'render'), this);
      return this.$el;
    };

    View.prototype.prepend = function(dom) {
      this.$el.prepend(dom);
      this.trigger("" + this.cid + ":" + (this.rendered ? 'update' : 'render'), this);
      return this.$el;
    };

    View.prototype.after = function(dom) {
      this.$el.after(dom);
      this.trigger("" + this.cid + ":update", this);
      return this.$el;
    };

    View.prototype.before = function(dom) {
      this.$el.after(dom);
      this.trigger("" + this.cid + ":update", this);
      return this.$el;
    };

    View.prototype.css = function(css) {
      this.$el.css(css);
      this.trigger("" + this.cid + ":update", this);
      return this.$el;
    };

    View.prototype.find = function(selector) {
      return this.$el.find(selector);
    };

    View.prototype.delegate = function(event, selector, handler) {
      if (arguments.length === 2) {
        handler = selector;
      }
      handler = handler.bind(this);
      if (arguments.length === 2) {
        return this.$el.on(event, handler);
      } else {
        return this.$el.on(event, selector, handler);
      }
    };

    View.prototype.bootstrap = function() {};

    View.prototype.initialize = function() {
      this.bootstrap();
      this.name = this.name || this.constructor.name;
      if (this.debug === true) {
        this.startDebugging();
      }
      if (this.autoRender === true) {
        this.render();
      }
      return this.trigger("" + this.cid + ":initialize", this);
    };

    View.prototype.getRenderData = function() {
      var _ref1;

      return (_ref1 = this.model) != null ? _ref1.toJSON() : void 0;
    };

    View.prototype.render = function() {
      this.trigger("" + this.cid + ":render:before", this);
      this.$el.attr('data-cid', this.cid);
      this.html(this.template(this.getRenderData()));
      this.rendered = true;
      this.trigger("" + this.cid + ":render:after", this);
      return this;
    };

    View.prototype.destroy = function(keepDOM) {
      var _ref1;

      if (keepDOM == null) {
        keepDOM = false;
      }
      this.trigger("" + this.cid + ":destroy:before", this);
      if (keepDOM) {
        this.dispose();
      } else {
        this.remove();
      }
      if ((_ref1 = this.model) != null) {
        _ref1.destroy();
      }
      return this.trigger("" + this.cid + ":destroy:after", this);
    };

    return View;

  })(Backbone.View);
  
});
window.require.register("routers/app_router", function(exports, require, module) {
  var AppRouter, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = AppRouter = (function(_super) {
    __extends(AppRouter, _super);

    function AppRouter() {
      this.curiosityDemo = __bind(this.curiosityDemo, this);
      this.astroDataDemo = __bind(this.astroDataDemo, this);
      this.solarSystemDemo = __bind(this.solarSystemDemo, this);
      this.index = __bind(this.index, this);    _ref = AppRouter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AppRouter.prototype.routes = {
      '': 'index',
      '/solar-system': 'solarSystemDemo',
      '/astro-data': 'astroDataDemo',
      '/curiosity': 'curiosityDemo'
    };

    AppRouter.prototype.index = function() {
      return console.log('index');
    };

    AppRouter.prototype.solarSystemDemo = function() {
      return console.log('solarSystemDemo');
    };

    AppRouter.prototype.astroDataDemo = function() {
      return console.log('astroDataDemo');
    };

    AppRouter.prototype.curiosityDemo = function() {
      return console.log('curiosityDemo');
    };

    return AppRouter;

  })(Backbone.Router);
  
});
window.require.register("views/app_view", function(exports, require, module) {
  var AppRouter, AppView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('lib/view');

  AppRouter = require('routers/app_router');

  module.exports = AppView = (function(_super) {
    __extends(AppView, _super);

    function AppView() {
      _ref = AppView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AppView.prototype.el = 'body.application';

    AppView.prototype.initialize = function() {
      var _ref1;

      this.router = new AppRouter();
      if (typeof CSLE !== "undefined" && CSLE !== null) {
        if ((_ref1 = CSLE.Routers) != null) {
          _ref1.AppRouter = this.router;
        }
      }
      return this.html(require('views/templates/home'));
    };

    return AppView;

  })(View);
  
});
window.require.register("views/templates/home", function(exports, require, module) {
  module.exports = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Handlebars.helpers;
    


    return "<div class='home'>\n  <a href='/#/solar-system'>Solar System</a>\n  <a href='/#/astro-data'>Astronomical Data</a>\n  <a href='/#/curiosity'>Curiosity</a>\n</div>";});
});
