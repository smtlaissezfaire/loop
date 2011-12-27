var executable = module.exports;

var fs = require("fs");

executable.run = function(options) {
  var argv               = options.argv;
  var compilationOptions = options.compilationOptions;
  var module             = options.module;

  var args = [];

  process.argv.forEach(function(val, index) {
    if (index !== 0 && index !== 1) {
      args.push(val);
    }
  });

  var compile = function(str) {
    var out = module(str, compilationOptions);
    process.stdout.write(out);
    process.stdout.write('\n');
  };

  if (args.length === 0) {
    var data = "";

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on("data", function(chunk) {
      data += chunk;
    });

    process.stdin.on("end", function() {
      compile(data, compilationOptions);
    });
  } else {
    args.forEach(function(file) {
      var buffer = fs.readFileSync(file);
      compile(buffer.toString(), compilationOptions);
    });
  }
};

