var tokenizer = require("tokenizer");

var TOKEN_TYPES = {
  OPEN_PAREN:  "CP",
  CLOSE_PAREN: "OP",
  WHITESPACE:  "WS",
  IDENTIFIER:  "ID"
};

exports.transform = function(source, callback) {
  var t = new tokenizer();

  var variableName;

  t.on("data", function(token, type) {
    if (type === TOKEN_TYPES.OPEN_PAREN) {

    } else if (type == TOKEN_TYPES.CLOSE_PAREN) {

    } else {
      variableName = token;
    }

    // console.log("token:" + token);
    // console.log("type:" + type);
  });

  t.on("end", function() {
    callback("var " + variableName + ";\n");
  });

  t.addRule(/^\($/,      TOKEN_TYPES.OPEN_PAREN);
  t.addRule(/^\)$/,      TOKEN_TYPES.CLOSE_PAREN);
  t.addRule(/^[a-z]+$/,  TOKEN_TYPES.IDENTIFIER);
  t.addRule(/^\s+$/,     TOKEN_TYPES.WHITESPACE);

  console.log('about to write source');
  t.write(source);
  t.end();
};
