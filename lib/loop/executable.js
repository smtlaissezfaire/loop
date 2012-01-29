var executable = module.exports;

var fs = require("fs");
var _ = require('./util/underscore');
var loop = require('../loop');

executable.run = function(options) {
  var programOptions = options.options;
  var defaultOptions = options.defaultOptions;
  var module         = options.module;
  var usage          = options.usage;

  var program = require('commander');
  program
    .version(loop.VERSION)
    .usage(usage);

  _.each(programOptions, function(array) {
    program.option.apply(program, array);
  });
  program.parse(process.argv);

  var files = program.args;

  var compilationOptions = _.extend(defaultOptions, program);

  var compile = function(str) {
    var out = module(str, compilationOptions);
    process.stdout.write(out);
    process.stdout.write('\n');
  };

  if (files.length === 0) {
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
    files.forEach(function(file) {
      var buffer = fs.readFileSync(file);
      compile(buffer.toString(), compilationOptions);
    });
  }
};
