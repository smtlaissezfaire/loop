var childProcess = require("child_process");

try {
  var async = require('async');
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

desc("Run tests");
task("spec", [], function() {
  process.env.NODE_ENV = "test";
  backtick("vows", [], null);
});

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

desc("Clean project for rebuilding (deletes node modules, generated grammar)");
task('clean', [], function() {
  backtick('rm', ['-rf', 'node_modules'], null, function() {
    backtick('rm', ['-rf', 'lib/loop/grammar.js']);
  });
});
