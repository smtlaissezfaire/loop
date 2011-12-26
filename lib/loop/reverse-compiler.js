var jsp = require("uglify-js").parser;
var _ = require('./underscore');

var reverseCompiler = {};

var createSyntaxTree = function(statement) {
  var expr;

  if (statement instanceof Array) {
    // there are no explicit statements in loop!
    if (statement[0] === 'stat') {
      statement = statement[1];
    }

    var functionName = statement[0];
    var args = statement.slice(1);
    var key,
        value;

    switch (functionName) {
      case 'var':
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

        break;
      case 'num':
        expr = {
          type: 'number',
          contents: statement[1]
        };

        break;
      case 'name':
        expr = {
          type: 'id',
          contents: args[0]
        };

        break;
      case 'assign':
        key = createSyntaxTree(statement[2]);
        value = createSyntaxTree(statement[3]);

        expr = {
          type: 'list',
          contents: [
            { type: 'id', contents: '=' },
            key,
            value
          ]
        };
        break;

      case 'dot':
        key = statement[1][1];
        value = statement[2];

        expr = {
          type: 'prop-access',
          key: key,
          value: value
        };

        break;

      case 'call':
        var contents = [];

        var fun = createSyntaxTree(args.shift());
        var convertedArgs = _.map(args[0], function(arg) {
          return createSyntaxTree(arg);
        });

        contents.push(fun);
        _.each(convertedArgs, function(arg) {
          contents.push(arg);
        });

        expr = {
          type: 'list',
          contents: contents
        };

        break;
      default:
        throw new Error("unknown type: " + functionName);
    }
  } else if (typeof statement === 'string') {
    expr = {
      type: 'id',
      contents: statement
    };
  } else {
    throw new Error('unknown type of statement:', statement);
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
    case 'prop-access':
      return statement.key + "." + statement.value;
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