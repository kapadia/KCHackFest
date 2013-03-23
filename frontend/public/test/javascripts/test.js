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

window.require.register("test/spec", function(exports, require, module) {
  
  
});
window.require.register("test/test-helpers", function(exports, require, module) {
  var expect;

  expect = require('expect.js');

  module.exports = {
    expect: expect
  };
  
});
window.require.register("test/views/app_view_test", function(exports, require, module) {
  var AppView;

  AppView = require('views/app_view');

  describe('AppView', function() {
    beforeEach(function() {
      return this.view = new AppView();
    });
    return it("should exist", function() {
      return expect(this.view).to.be.ok();
    });
  });
  
});
window.require.register("test/views/astro_data_test", function(exports, require, module) {
  var AstroDataView;

  AstroDataView = require('views/astro_data');

  describe('AstroDataView', function() {
    return beforeEach(function() {
      return this.view = new AstroDataView();
    });
  });
  
});
window.require.register("test/views/curiosity_test", function(exports, require, module) {
  var CuriosityView;

  CuriosityView = require('views/curiosity');

  describe('CuriosityView', function() {
    return beforeEach(function() {
      return this.view = new CuriosityView();
    });
  });
  
});
window.require.register("test/views/solar_system_test", function(exports, require, module) {
  var SolarSystemView;

  SolarSystemView = require('views/solar_system');

  describe('SolarSystemView', function() {
    return beforeEach(function() {
      return this.view = new SolarSystemView();
    });
  });
  
});
window.require('test/views/app_view_test');
window.require('test/views/astro_data_test');
window.require('test/views/curiosity_test');
window.require('test/views/solar_system_test');
