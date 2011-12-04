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

tokenBuilders.makeNumber = function(number) {
  if (typeof number !== 'number') {
    number = parseInt(number, 10);
  }

  return {
    type: 'number',
    contents: number
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

module.exports = tokenBuilders;