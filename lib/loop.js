var tokenizer = require("tokenizer");

var TOKEN_TYPES = {
  OPEN_PAREN:  "CP",
  CLOSE_PAREN: "OP",
  WHITESPACE:  "WS",
  IDENTIFIER:  "ID",
  NUMBER:      "NUM"
};

exports.transform = function(source, callback) {
  var t = new tokenizer();

  var tokens = [];

  t.on("data", function(tokenString, type) {
    if (type !== TOKEN_TYPES.WHITESPACE) {
      tokens.push({string: tokenString, type: type});
    }
  });

  t.on("end", function() {
    callback(makeList(tokens, 0));
  });

  var makeList = function(tokens, index) {
    if (tokens[index].type === TOKEN_TYPES.OPEN_PAREN)  {
      index++;
    } else {
      throw "error - list with first elment not an open paren!";
    }

    if (tokens[index].string === "define") {
      index++;

      var variable,
          value;

      variable = tokens[index];
      index++;

      if (tokens[index].type !== TOKEN_TYPES.CLOSE_PAREN) {
        value = tokens[index];
        index++;
      }

      return define(variable, value);
    }
  };

  var define = function(variable, value) {
    if (value) {
      return "var" + " " + variable.string + " = " + value.string + ";\n";
    } else {
      return "var" + " " + variable.string + ";\n";
    }
  }

  t.addRule(/^\($/,      TOKEN_TYPES.OPEN_PAREN);
  t.addRule(/^\)$/,      TOKEN_TYPES.CLOSE_PAREN);
  t.addRule(/^[a-z]+$/,  TOKEN_TYPES.IDENTIFIER);
  t.addRule(/^[0-9]+$/,  TOKEN_TYPES.NUMBER);
  t.addRule(/^\s+$/,     TOKEN_TYPES.WHITESPACE);

  t.write(source);
  t.end();
};
