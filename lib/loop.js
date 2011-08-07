var transformers = require(__dirname + "/loop/transformers");
var parser = require(__dirname + "/grammar.js").parser;

exports.transform = function(source, callback) {
  var statements = parser.parse(source);

  var out = statements.map(function(statement) {
    return transformers.transformParseTree(statement);
  });

  callback(out.join(""));
};
