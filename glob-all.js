// Generated by CoffeeScript 1.7.1
(function() {
  var File, Glob, GlobAll, async, globAll;

  Glob = require("glob").Glob;

  async = require("async");

  File = (function() {
    function File(pattern, globId, path, fileId) {
      this.pattern = pattern;
      this.globId = globId;
      this.path = path;
      this.fileId = fileId;
      this.include = true;
      while (this.pattern.charAt(0) === "!") {
        this.include = !this.include;
        this.pattern = this.pattern.substr(1);
      }
    }

    File.prototype.compare = function(other) {
      var p1, p2, stars;
      stars = /((\/\*\*)?\/\*)?\.(\w+)$/;
      p1 = this.pattern.replace(stars, '');
      p2 = other.pattern.replace(stars, '');
      if (p1.length > p2.length) {
        return this;
      } else {
        return other;
      }
    };

    File.prototype.toString = function() {
      return "" + this.path + " (" + this.fileId + ": " + this.pattern;
    };

    return File;

  })();

  GlobAll = (function() {
    function GlobAll(array, opts, callback) {
      this.array = array;
      this.opts = opts != null ? opts : {};
      this.callback = callback;
      this.sync = typeof this.callback !== 'function';
      this.opts.statCache = this.opts.statCache || {};
      this.opts.sync = this.sync;
      this.items = [];
    }

    GlobAll.prototype.run = function() {
      async.series(this.array.filter((function(_this) {
        return function(str, i) {
          if (/^(\w+:)?\/\//.test(str)) {
            _this.items.push(new File(str, i));
            return false;
          }
          return true;
        };
      })(this)).map((function(_this) {
        return function(str, globId) {
          return _this.globOne(str, globId);
        };
      })(this)), this.globbedAll.bind(this));
      return this.results;
    };

    GlobAll.prototype.globOne = function(pattern, globId) {
      return (function(_this) {
        return function(callback) {
          var g, gotFiles;
          g = null;
          gotFiles = function(error, files) {
            if (files) {
              files = files.map(function(f, fileId) {
                return new File(pattern, globId, f, fileId);
              });
            }
            callback(error, files);
          };
          if (_this.sync) {
            g = new Glob(pattern, _this.opts);
            gotFiles(null, g.found);
          } else {
            g = new Glob(pattern, _this.opts, gotFiles);
          }
        };
      })(this);
    };

    GlobAll.prototype.globbedAll = function(err, allFiles) {
      var existing, f, files, k, path, set, v, _i, _j, _len, _len1;
      set = {};
      for (_i = 0, _len = allFiles.length; _i < _len; _i++) {
        files = allFiles[_i];
        for (_j = 0, _len1 = files.length; _j < _len1; _j++) {
          f = files[_j];
          path = f.path;
          existing = set[path];
          if (!existing) {
            if (f.include) {
              set[path] = f;
            }
            continue;
          }
          if (f.include) {
            set[path] = f.compare(existing);
          } else {
            delete set[path];
          }
        }
      }
      files = [];
      for (k in set) {
        v = set[k];
        files.push(v);
      }
      files.sort(function(a, b) {
        if (a.globId < b.globId) {
          return -1;
        }
        if (a.globId > b.globId) {
          return 1;
        }
        if (a.fileId >= b.fileId) {
          return 1;
        } else {
          return -1;
        }
      });
      this.results = files.map(function(f) {
        return f.path;
      });
      if (!this.sync) {
        this.callback(null, this.results);
      }
      return this.results;
    };

    return GlobAll;

  })();

  globAll = module.exports = function(array, opts, callback) {
    var all;
    if (typeof array === 'string') {
      array = [array];
    }
    if (!(array instanceof Array)) {
      throw new TypeError('Invalid input');
    }
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    all = new GlobAll(array, opts, callback);
    return all.run();
  };

  globAll.sync = globAll;

}).call(this);
