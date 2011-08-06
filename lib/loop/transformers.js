var transformers = exports;

var EXPRESSION_TYPES = {
  SYMBOL: "SYM",
  NUMBER: "NUM",
  LIST: "LIST"
};

var Null = null;

var _var = function(variable, value) {
  if (value) {
    return "var" + " " + variable._eval() + " = " + value._eval() + ";\n";
  } else {
    return "var" + " " + variable._eval() + ";\n";
  }
};

var callFunction = function(fun, argTokens){
  var str = "";
  str += fun + "(";

  argTokens.forEach(function(token, index) {
    if (index !== 0) {
      str += ", ";
    }

    str += token._eval();
  });

  str += ");\n";
  return str;
};

var assignment = function(variable, value) {
  return variable._eval() + " = " + value._eval() + ";\n";
};

var propget = function(obj, method) {
  return obj._eval() + "." + method._eval() + ";\n";
};

var propset = function(obj, method, value) {
  return obj._eval() + "." + method._eval() + " = " + value._eval() + ";\n";
};

var evList = function(list) {
  var variable,
      value,
      obj,
      method,
      firstArg,
      fun;

  firstArg = list.shift();
  args     = list;

  // if (!fun) {
  //   return [];
  // }

  fun = firstArg._eval();

  if (fun === "var") {
    return _var(args[0], args[1]);
  } else if (fun === "=") {
    return assignment(args[0], args[1]);
  } else if (fun === "propget") {
    obj = args[0];
    method = args[1];

    return propget(obj, method);
  } else if (fun === "propset") {
    obj = args[0];
    method = args[1];
    value = args[2];

    return propset(obj, method, value);
  } else {
    return callFunction(fun, args);
  }
};

exports.makeList = function(list) {
  return {
    type: EXPRESSION_TYPES.LIST,
    tokens: list,
    _eval: function() {
      return evList(list);
    }
  };
};

exports.makeSymbol = function(str) {
  return {
    type: EXPRESSION_TYPES.SYMBOL,
    token: str,
    _eval: function() { return str; }
  };
};

exports.makeNumber = function(num) {
  return {
    type: EXPRESSION_TYPES.NUMBER,
    token: num,
    _eval: function() {
      return parseInt(num, 10);
    }
  };
};

exports.transformParseTree = function(tree) {
  return tree._eval();
};
