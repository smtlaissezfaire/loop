var exports = {};
var _ = require('underscore');
var helpers = require('./helpers');
var car = helpers.car;
var cdr = helpers.cdr;

// forward declarations
var processStatement;

// HELPERS

var stmt = function() {
  return ['stat'].concat(_.toArray(arguments));
};

var processArguments = function(args) {
  return _.map(args, function(arg) {
    return processStatement(arg);
  });
};

var UNARY_KEYWORDS = [
  "typeof",
  "void",
  "delete",
  "--",
  "++",
  "!",
  "~",
];

var BINARY_OPERATORS = [
  "||",
  "&&",
  "|",
  "^",
  "&",
  "==",
  "===",
  "!=",
  "!==",
  "<",
  ">",
  "<=",
  ">=",
  "in",
  "instanceof",
  ">>",
  "<<",
  ">>>",
  "+",
  "-",
  "*",
  "/",
  "%"
];

// MAIN

var processStatement = function(tree) {
  switch (tree.type) {
    case 'funcall':
      var f = tree.function;
      var args = tree.arguments;
      if (args.type !== 'list') {
        throw new Error('arguments should be a list');
      }
      args = args.contents;

      if (f.type === 'id') {
        if (f.contents === 'lambda' || f.contents === 'function') {
          var formalArgs = _.map(car(args).contents, function(arg) {
            return processStatement(arg);
          });

          var body = _.map(car(cdr(args)).contents, function(statement) {
            return stmt(processStatement(statement));
          });

          var functionName = null; // fixme - should we ever have a function name?

          return ["function", functionName, formalArgs, body];
        } else if (_.include(BINARY_OPERATORS, f.contents)) {
          if (args.length !== 2) {
            throw new Error(f.contents + " requires two arguments");
          }

          return ['binary', f.contents].concat(processArguments(args));
        } else if (_.include(UNARY_KEYWORDS, f.contents)) {
          if (args.length !== 1) {
            throw new Error(f.contents + " requires one argument");
          }
          return ["unary-prefix", f.contents, processStatement(args[0])];
        } else {
          return ['call', processStatement(f), processArguments(args)];
        }
      } else if (f.type === 'funcall') {
        return ['call', processStatement(f), processArguments(args)];
      } else if (f.type === 'prop-access') {
        return ['call', processStatement(f), processArguments(args)];
      } else {
        throw new Error('not a function, id, or prop access in function position');
      }
    case 'prop-access':
      // TODO: support dynamic value types (?)
      if (tree.value.type !== 'id') {
        throw new Error("Invalid property access - looking for computed value");
      }

      return ['dot', processStatement(tree.key), tree.value.contents];
    case 'id':
      return ['name', tree.contents];
    case 'string':
      return ['string', tree.contents];
    default:
      throw new Error("Don't know how to process tree: " + JSON.stringify(tree));
  }
};

exports.transform = function(statements) {
  return [
    'toplevel',
    _.map(statements, function(statement) {
      return stmt(processStatement(statement));
    })
  ];
};

module.exports = exports;