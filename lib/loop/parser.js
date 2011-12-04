var grammarParser = require(__dirname + "/grammar.js").parser;

var parser = {};

parser.parse = function(str, options) {
  var parsedOutput = grammarParser.parse(str);

  if (options.notTopLevel) {
    return parsedOutput[0];
  } else {
    return parsedOutput;
  }
};

module.exports = parser;