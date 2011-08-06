var async = require('async');
var childProcess = require("child_process");

desc("Lint + Run tests");
task("default", ["grammar", "lint", "test"]);

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

desc("Run tests");
task("test", [], function() {
  process.env.NODE_ENV = "test";
  backtick("vows", [], null);
});

desc("Run tests");
task("spec", ["test"]);

var EXCLUDED_LINT_FILES = [
  /node_modules/,
  /grammar.js/
];

desc("Run js lint (jsl)");
task("lint", [], function() {
  backtick("find", [__dirname, '-name', '*.js'], null, function(err, out) {
    if (err) { throw new Error(err); }
    var files = out.split("\n").filter(function(f) {
      if (!f) { return false; }
      return EXCLUDED_LINT_FILES.every(function(rule) {
        return !f.match(rule);
      });
    });
    async.forEach(files, function(file, callback) {
      var args = [file];
      if (/pub\/js/.test(file)) {
        args.push("--browser");
      }
      backtick("jslint", args, null, function(err, out) {
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
          "install via `npm install jslint -g`");
      }
      else if (err) {
        throw new Error(err);
      }
    });
  });
});

desc("Compile the jison grammar");
task("grammar", [], function() {
  backtick("jison", ["./lib/grammar.jison", "-o", "./lib/grammar.js"], null, function(err, out) {
    if (err) {
      throw new Error(err);
    }

    complete();
  });
}, true);
