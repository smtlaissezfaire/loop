var tokenBuilders = {};

tokenBuilders.makeList = function(contents) {
  return {
    type: 'list',
    contents: contents
  };
};

tokenBuilders.makeSymbol = function(symbol) {
  return {
    type: 'id',
    contents: symbol
  };
};

tokenBuilders.makeNumber = function(intPart, fractionalPart) {
  var str = intPart;
  if (fractionalPart) {
    str += "." + fractionalPart;
  }

  var num = parseFloat(str);

  return {
    type: 'number',
    contents: num
  };
};

tokenBuilders.makeString = function(str) {
  return {
    type: 'string',
    contents: str.slice(1, -1)
  };
};

tokenBuilders.makePropertyAccess = function(key, value) {
  return {
    type: 'prop-access',
    contents: {
      key: key,
      value: value
    }
  };
};

tokenBuilders.makeMacroPattern = function() {
  return {
    type: 'macro-pattern'
  };
};

module.exports = tokenBuilders;