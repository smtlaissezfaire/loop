var childProcess = require("child_process");
var fs = require('fs');

try {
  var async = require('async');
  var _ = require('underscore');
} catch(e) {
  console.warn("Are all dependencies resolved?  If not, try running jake deps");
}

desc("Lint + Run tests");
task("default", ["grammar", "lint", "spec"]);

var backtick = function(command, args, options, callback) {
  var stream = childProcess.spawn(command, args, options);
  var stdoutData = "";
  var stderrData = "";

  stream.stdout.on('data', function(data) {
    if (callback) {
      stdoutData += data;
    } else {
      process.stdout.write(data);
    }
  });

  stream.stderr.on('data', function(data) {
    if (callback) {
      stderrData += data;
    } else {
      process.stderr.write(data);
    }
  });

  if (callback) {
    stream.on("exit", function() {
      callback(stderrData, stdoutData);
    });
  }
};

var findFilesInDir = function(findArgs, cb) {
  backtick("find", findArgs, null, function(err, out) {
    if (err) {
      return cb(err);
    }

    out = out.trim();
    var files = out.split("\n");
    cb(null, files);
  });
};

var findJsFilesInDir = function(dir, cb) {
  findFilesInDir([dir, '-name', '*.js'], cb);
};

var findLoopFilesInDir = function(dir, cb) {
  findFilesInDir([dir, '-name', '*.loop'], cb);
};

desc("Run tests");
task("spec", [], function() {
  backtick("mocha", ["-c"], null);
});

desc('Run tests while watching for updates');
task("spec-watch", [], function() {
  backtick("mocha", ["-c", "--watch"], null);
});

var EXCLUDED_LINT_FILES = [
  /node_modules/,
  /grammar.js/
];

desc("Run js lint (jsl)");
task("lint", [], function() {
  findJsFilesInDir(__dirname, function(err, files) {
    if (err) { throw new Error(err); }

    files = files.filter(function(f) {
      if (!f) { return false; }
      return EXCLUDED_LINT_FILES.every(function(rule) {
        return !f.match(rule);
      });
    });

    async.forEach(files, function(file, callback) {
      var args = [file];

      backtick("./node_modules/jslint/bin/jslint.js", args, null, function(err, out) {
        if (err) {
          callback(err);
        }
        else if (out && !/No errors found/.test(out)) {
          console.error(out);
          callback(null);
        }
      });
    }, function(err) {
      if (err && /execvp\(\)/.test(err.toString())) {
        throw new Error("jslint not installed or in path, " +
          "install via `jake deps`");
      }
      else if (err) {
        throw new Error(err);
      }
    });
  });
});

desc("Compile the jison grammar");
task("grammar", [], function() {
  backtick("jison", ["./lib/loop/grammar.jison", "-o", "./lib/loop/grammar.js"], null, function(err, out) {
    if (err) {
      throw new Error(err);
    }

    complete();
  });
}, true);

desc('Install node package dependencies local');
task('deps', [], function() {
  backtick('npm', ['install'], null, function(err, out) {
    if (err.trim().length > 0) { console.error(err); }
    if (out.trim().length > 0) { console.error(out); }
    complete();
  });
}, true);

desc("Clean generated grammar");
task('clean', [], function() {
  console.log('clearing generated grammar');
  backtick('rm', ['-rf', 'lib/loop/grammar.js']);

  console.log('cleaning generated loop files');
  findLoopFilesInDir('.', function(err, files) {
    if (err) {
      throw err;
    }

    _.each(files, function(file) {
      // console.log('cleaning loop file:', file);
      backtick('rm', ['-rf', file]);
    });
  });
});

desc("Clean everything possible (including node_modules)");
task('clean_all', ['clean'], function() {
  console.log('clearing node_modules');
  backtick('rm', ['-rf', 'node_modules']);
});

namespace('compiler', function() {
  desc("Reverse compile the compiler");
  task('reverse_compile', ["grammar"], function() {
    var libFiles;
    var specFiles;

    async.parallel({
      libFiles: function(cb) {
        findJsFilesInDir("lib", cb);
      },
      specFiles: function(cb) {
        findJsFilesInDir('spec', cb);
      }
    }, function(err, fileDirs) {
      if (err) {
        throw err;
      }

      var filesToWrite = [];

      _.each(fileDirs, function(files, dir) {
        _.each(files, function(file) {
          filesToWrite.push(file);
        });
      });

      async.forEach(filesToWrite, function(file, cb) {
        var loopFileName = "./" + file.replace('.js', '.loop');
        console.log('reverse compiling file:', file, '=>', loopFileName);
        backtick('./bin/reverse-loop', [file], null, function(err, out) {
          if (err) {
            console.error("ERROR Compiling file:", file);
            console.error(err);
            return cb(err);
          }

          fs.writeFile(loopFileName, out, function(err) {
            if (err) {
              console.error('Error writing loop file:', loopFileName);
              console.error(err);
              return cb(err);
            }

            cb();
          });
        });
      }, complete);
    });
  }, {async: true});

  desc("Compile the files into javascript");
  task('compile', ["reverse_compile"], function() {
    var libFiles;
    var specFiles;

    async.parallel({
      libFiles: function(cb) {
        findLoopFilesInDir("lib", cb);
      },
      // specFiles: function(cb) {
      //   findJsFilesInDir('spec', cb);
      // }
    }, function(err, fileDirs) {
      if (err) {
        throw err;
      }

      _.each(fileDirs, function(files, dir) {
        _.each(files, function(file) {
          var loopFileName = "./" + file.replace('.loop', '.js');
          console.log('compiling file:', file, '=>', loopFileName);
          backtick('./bin/loop', [file], null, function(err, out) {
            if (err) {
              console.error("ERROR Compiling file:", file);
              console.error(err);
              return;
            }

            fs.writeFile(loopFileName, out, function(err) {
              if (err) {
                console.error('Error writing loop file:', loopFileName);
                console.error(err);
              }
            });
          });
        });
      });
    });
  });
});
