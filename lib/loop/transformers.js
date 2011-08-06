var transformers = exports;
var tokenTypes = require(__dirname + "/token_types");

exports.var = function(variable, value) {
  if (value) {
    return "var" + " " + variable.string + " = " + value.string + ";\n";
  } else {
    return "var" + " " + variable.string + ";\n";
  }
};

exports.assignment = function(variable, value) {
  return variable.string + " = " + value.string + ";\n";
};

exports.callFunction = function(funToken, argTokens){
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

exports.propget = function(objToken, methodToken) {
  return objToken.string + "." + methodToken.string + ";\n";
};

exports.propset = function(objToken, methodToken, valueToken) {
  return objToken.string + "." + methodToken.string + " = " + valueToken.string + ";\n";
};

exports.makeList = function(tokens, index) {
  var openParen = tokens[index]; index++;
  var fun = tokens[index]; index++;
  var args = [];

  var stop = false;

  tokens.slice(index).forEach(function(token) {
    if (!stop) {
      if (token.type === tokenTypes.CLOSE_PAREN) {
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
      value,
      obj,
      method;

  if (fun.string === "var") {
    variable = args[0];
       value = args[1];

    return transformers.var(variable, value);
  } else if (fun.string === "=") {
    variable = args[0];
       value = args[1];

    return transformers.assignment(variable, value);
  } else if (fun.string === "propget") {
    obj = args[0];
    method = args[1];

    return transformers.propget(obj, method);
  } else if (fun.string === "propset") {
    obj = args[0];
    method = args[1];
    value = args[2];

    return transformers.propset(obj, method, value);
  } else {
    return transformers.callFunction(fun, args);
  }
};

exports.makeNumber = function(token) {
  return token[0].string;
};
