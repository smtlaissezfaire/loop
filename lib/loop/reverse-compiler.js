var jsp = require("uglify-js").parser;
var _ = require('./underscore');

var reverseCompiler = {};

var createSyntaxTree = function(statement) {
  var expr;

  if (statement instanceof Array) {
    var functionName = statement[0];
    var args = statement.slice(1);

    if (functionName === 'var') {
      expr = {
        type: 'list',
        contents: [
          { type: 'id', contents: functionName },
        ]
      };

      args = args[0];

      var pairs = _.map(args, function(arrayPair) {
        var name = createSyntaxTree(arrayPair[0]);
        var value;

        if (arrayPair[1]) {
          value = createSyntaxTree(arrayPair[1]);
        }

        var returnValue = {
          type: 'list',
          contents: [
            name
          ]
        };

        if (value) {
          returnValue.contents.push(value);
        }

        return returnValue;
      });

      _.each(pairs, function(pair) {
        expr.contents.push(pair);
      });
    } else if (functionName === 'num') {
      expr = {
        type: 'number',
        contents: statement[1]
      };
    }
  } else if (typeof statement === 'string') {
    expr = {
      type: 'id',
      contents: statement
    };
  }

  return expr;
};

var syntaxTreeToString = function(statement) {
  switch (statement.type) {
    case 'list':
      var inner = _.map(statement.contents, function(el) {
        return syntaxTreeToString(el);
      });

      return "(" + inner.join(" ") + ")";
    case 'id':
    case 'number':
      return statement.contents;
    default:
      throw new Error('unknown statement type: ' + statement.type);
  }
};

reverseCompiler.compile = function(jsSource) {
  var jsp = require("uglify-js").parser;

  var parsedJsSource = jsp.parse(jsSource);
  if (parsedJsSource[0] !== 'toplevel') {
    throw new Error('can only reverse compile from top level js');
  }

  var statements = parsedJsSource.slice(1)[0];

  statements = _.map(statements, function(statement) {
    return createSyntaxTree(statement);
  });

  return _.map(statements, function(statement) {
    return syntaxTreeToString(statement);
  }).join('\n');
};

module.exports = reverseCompiler;