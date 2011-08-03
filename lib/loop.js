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
    var openParen = tokens[index]; index++;
    var fun = tokens[index]; index++;
    var args = [];

    var stop = false;

    tokens.slice(index).forEach(function(token) {
      if (!stop) {
        if (token.type === TOKEN_TYPES.CLOSE_PAREN) {
          index++;
          stop = true;
        } else {
          args.push(token);
          index++;
        }
      }
    });

    // if (tokens[index].type === TOKEN_TYPES.OPEN_PAREN)  {
    //   index++;
    // } else {
    //   throw "error - list with first elment not an open paren!";
    // }

    var variable,
        value;

    if (fun.string === "define") {
      variable = args[0];
         value = args[1];

      return define(variable, value);
    } else if (fun.string === "=") {
      variable = args[0];
         value = args[1];

      return assignment(variable, value);
    } else {
      return callFunction(fun, args);
    }
  };

  var define = function(variable, value) {
    if (value) {
      return "var" + " " + variable.string + " = " + value.string + ";\n";
    } else {
      return "var" + " " + variable.string + ";\n";
    }
  };

  var assignment = function(variable, value) {
    return variable.string + " = " + value.string + ";\n";
  };

  var callFunction = function(funToken, argTokens){
    var str = "";
    str += funToken.string + "(";

    argTokens.forEach(function(token, index) {
      if (index !== 0) {
        str += ", ";
      }

      str += token.string;
    });

    str += ");\n";
    return str;
  };

  t.addRule(/^\($/,        TOKEN_TYPES.OPEN_PAREN);
  t.addRule(/^\)$/,        TOKEN_TYPES.CLOSE_PAREN);
  t.addRule(/^[a-z\=]+$/,  TOKEN_TYPES.IDENTIFIER);
  t.addRule(/^[0-9]+$/,    TOKEN_TYPES.NUMBER);
  t.addRule(/^\s+$/,       TOKEN_TYPES.WHITESPACE);

  t.write(source);
  t.end();
};
