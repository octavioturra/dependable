// Generated by CoffeeScript 1.3.3
(function() {
  var existsSync, fs, path, _ref;

  path = require('path');

  fs = require('fs');

  existsSync = (_ref = fs.existsSync) != null ? _ref : path.existsSync;

  exports.container = function() {
    var argList, container, factories, get, haveVisited, load, loadClassFile, loaddir, loadfile, notEmpty, register, registerClass, registerOne, resolve, toFactory;
    factories = {};
    register = function(name, func, args) {
      var hash, _results;
      if (name === Object(name)) {
        hash = name;
        _results = [];
        for (name in hash) {
          func = hash[name];
          _results.push(registerOne(name, func, args));
        }
        return _results;
      } else {
        return registerOne(name, func, args);
      }
    };
    registerClass = function(name, func, args) {
      var binded, proto;
      if (name[0].toUpperCase() !== name[0]) {
        name = func.name[0].toUpperCase() + func.name.substr(1);
      }
      proto = Object.create(func.prototype);
      binded = func.bind(proto);
      resolve(binded, argList(func));
      register(func.name, func, args);
      name = func.name[0].toLowerCase() + func.name.substr(1);
      return register(name, proto);
    };
    registerOne = function(name, func, args) {
      if (!(func != null)) {
        throw new Error("cannot register null function");
      }
      return factories[name] = toFactory(func, args);
    };
    load = function(file) {
      var exists, stats;
      exists = existsSync(file);
      if (exists) {
        stats = fs.statSync(file);
        if (stats.isDirectory()) {
          return loaddir(file);
        }
      }
      return loadfile(file);
    };
    loadfile = function(file) {
      var module, name;
      module = file.replace(/\.\w+$/, "");
      name = path.basename(module).replace(/\-(\w)/g, function(match, letter) {
        return letter.toUpperCase();
      });
      return register(name, require(module));
    };
    loadClassFile = function(file) {
      var module, name;
      module = file.replace(/\.\w+$/, "");
      name = path.basename(module).replace(/\-(\w)/g, function(match, letter) {
        return letter.toUpperCase();
      });
      return registerClass(name, require(module));
    };
    loaddir = function(dir) {
      var file, filenames, files, stats, _i, _len, _results;
      filenames = fs.readdirSync(dir);
      files = filenames.map(function(file) {
        return path.join(dir, file);
      });
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        if (!file.match(/\.(js|coffee)$/)) {
          continue;
        }
        stats = fs.statSync(file);
        if (stats.isFile()) {
          _results.push(loadfile(file));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    toFactory = function(func, args) {
      if (typeof func === "function") {
        return {
          func: func,
          required: argList(func)
        };
      } else if (args) {
        return {
          func: func,
          required: args
        };
      } else {
        return {
          func: function() {
            return func;
          },
          required: []
        };
      }
    };
    argList = function(func) {
      var match, required;
      match = func.toString().match(/function.*?\(([\s\S]*?)\)/);
      if (!(match != null)) {
        throw new Error("could not parse function arguments: " + (func != null ? func.toString() : void 0));
      }
      required = match[1].split(",").filter(notEmpty).map(function(str) {
        return str.trim();
      });
      return required;
    };
    notEmpty = function(a) {
      return a;
    };
    get = function(name, overrides, visited) {
      var dependencies, factory, instance, isOverridden;
      if (visited == null) {
        visited = [];
      }
      isOverridden = overrides != null;
      if (haveVisited(visited, name)) {
        throw new Error("circular dependency with '" + name + "'");
      }
      visited = visited.concat(name);
      factory = factories[name];
      if (!(factory != null)) {
        throw new Error("dependency '" + name + "' was not registered");
      }
      if ((factory.instance != null) && !isOverridden) {
        return factory.instance;
      }
      dependencies = factory.required.map(function(name) {
        if ((overrides != null ? overrides[name] : void 0) != null) {
          return overrides != null ? overrides[name] : void 0;
        } else {
          return get(name, overrides, visited);
        }
      });
      instance = factory.func.apply(factory, dependencies);
      if (!isOverridden) {
        factory.instance = instance;
      }
      return instance;
    };
    haveVisited = function(visited, name) {
      var isName;
      isName = function(n) {
        return n === name;
      };
      return visited.filter(isName).length;
    };
    resolve = function(overrides, func, args) {
      if (!func) {
        func = overrides;
        overrides = null;
        args = args;
      }
      register("__temp", func, args);
      return get("__temp", overrides);
    };
    container = {
      get: get,
      resolve: resolve,
      register: register,
      registerClass: registerClass,
      load: load,
      loadClassFile: loadClassFile
    };
    container.register("_container", container);
    return container;
  };

}).call(this);
