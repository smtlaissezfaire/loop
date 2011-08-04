var tokenizer = require("tokenizer");
var transformers = require(__dirname + "/loop/transformers");
var tokenTypes = require(__dirname + "/loop/token_types");

exports.transform = function(source, callback) {
  var t = new tokenizer();

  var tokens = [];

  t.on("data", function(tokenString, type) {
    if (type !== tokenTypes.WHITESPACE) {
      tokens.push({string: tokenString, type: type});
    }
  });

  t.on("end", function() {
    callback(transformers.makeList(tokens, 0));
  });

  t.addRule(/^\($/,        tokenTypes.OPEN_PAREN);
  t.addRule(/^\)$/,        tokenTypes.CLOSE_PAREN);
  t.addRule(/^[a-z\=]+$/,  tokenTypes.IDENTIFIER);
  t.addRule(/^[0-9]+$/,    tokenTypes.NUMBER);
  t.addRule(/^\.+$/,       tokenTypes.PERIOD);
  t.addRule(/^\s+$/,       tokenTypes.WHITESPACE);

  t.write(source);
  t.end();
};
