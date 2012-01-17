var tokenBuilders = {};

tokenBuilders.makeList = function(contents, sourceInfo) {
  return {
    type: 'list',
    contents: contents,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeComment = function(comment, sourceInfo) {
  return {
    type: 'comment',
    contents: comment.slice(2).trim(),
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeSymbol = function(symbol, sourceInfo) {
  return {
    type: 'id',
    contents: symbol,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeNumber = function(intPart, fractionalPart, sourceInfo) {
  var str = intPart;
  if (fractionalPart) {
    str += "." + fractionalPart;
  }

  var num = parseFloat(str);

  return {
    type: 'number',
    contents: num,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeString = function(str, sourceInfo) {
  return {
    type: 'string',
    contents: str.slice(1, -1),
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makePropertyAccess = function(key, value, sourceInfo) {
  return {
    type: 'prop-access',
    contents: {
      key: key,
      value: value,
      sourceInfo: sourceInfo
    }
  };
};

tokenBuilders.makeMacroPattern = function(sourceInfo) {
  return {
    type: 'macro-pattern',
    sourceInfo: sourceInfo
  };
};

module.exports = tokenBuilders;