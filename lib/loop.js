var transformers = require(__dirname + "/loop/transformers");
var parser = require(__dirname + "/grammar.js").parser;

exports.transform = function(source, callback) {
  var result = parser.parse(source);
  callback(transformers.transformParseTree(result));
};
