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
    contents: str
  };
};

module.exports = tokenBuilders;