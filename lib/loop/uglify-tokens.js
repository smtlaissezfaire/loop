
var _ = require('underscore');

// FORWARD DECLARATIONS
var main;
var processList;

// HELPERS

var stmt = function() {
  return ['stat'].concat(_.toArray(arguments));
};

var expr = function() {
  return _.toArray(arguments);
};

// keyword processors

var keywordProcessors = {};

keywordProcessors.var = function(lists) {
  console.log('listToken', lists);

  if (lists instanceof Array !== true) {
    throw new Error('var takes an array of lists');
  }

  return _.map(lists, function(pair) {
    console.log("foo", pair[0]);
  });
};

// TOKEN TYPES

var tokenBuilders = {};

tokenBuilders.num = function(num) {
  return ['num', num];
};

tokenBuilders.string = function(str) {
  return ['string', str];
};

tokenBuilders.binary = function(combinator, el1, el2) {
  return ['binary', combinator, expr(el1), expr(el2)];
};

tokenBuilders['unary-postfix'] = function(combinator, el) {
  return ['unary-postfix', combinator, expr(el)];
};

tokenBuilders['unary-prefix'] = function(combinator, el) {
  return ['unary-prefix', combinator, expr(el)];
};

tokenBuilders.name = function(token) {
  if (token.type !== 'string') {
    throw new Error("names should be represented by strings");
  }

  return ['name', token.contents];
};

tokenBuilders.assignment = function(assignmentType, variable, value) {
  if (assignmentType === "=") {
    assignmentType = true;
  }

  return ['assign', assignmentType, expr(variable), expr(value)];
};

tokenBuilders.keyword = function() {
  var args = _.toArray(arguments);
  var keyword = args.shift();

  switch (keyword) {
    case 'var':
      return ['var', keywordProcessors.var(args)];
    default:
      throw new Error('unknown keyword: ' + keyword);
  }
};

// MAIN

processList = function(elements) {
  var functionName = elements.shift();
  var f = tokenBuilders[functionName];

  if (!f) {
    throw new Error('No matching translation function by that name');
  }

  return f.apply(this, elements);
};

expr = function(token) {
  switch (token.type) {
    case 'number':
      return tokenBuilders.num(token.contents);
    case 'string':
      return tokenBuilders.string(token.contents);
    case 'list':
      return processList(token.contents);
    default:
      throw new Error('unknown token');
  }
};

main = function(token) {
  var value = expr(token);
  return stmt(value);
};

module.exports = main;