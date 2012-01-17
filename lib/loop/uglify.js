var exports = {};
var _ = require('underscore');
var helpers = require('./helpers');
var car = helpers.car;
var cdr = helpers.cdr;

// forward declarations
var progn;
var processStatementOrExpression;

// HELPERS

var stmt = function() {
  return ['stat'].concat(_.toArray(arguments));
};

var processArguments = function(args) {
  return _.map(args, function(arg) {
    return progn(arg);
  });
};

var processBody = function(args) {
  return _.map(args, function(statement) {
    return processStatementOrExpression(statement);
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

var _var = function(pairs) {
  if (pairs.length === 0) {
    throw new Error("Var must give at least one argument to var");
  }

  // (var (foo bar))
  pairs = _.map(pairs, function(pair) {
    if (pair.length === 0) {
      throw new Error('var is missing a variable name');
    }

    var name = pair[0];
    var valueArgs = pair[1];
    var value;

    if (name.type !== 'id') {
      throw new Error("Var nameword can't take dynamic variable names");
    }

    if (valueArgs.length > 1) {
      throw new Error("Only a variable and a value can be set for each pair in a var statement");
    }

    if (valueArgs[0]) {
      value = valueArgs[0];
    }

    if (value) {
      return [name, value];
    } else {
      return [name];
    }
  });

  processedArgs = _.map(pairs, function(pair) {
    var variable = pair[0].contents;
    var value;

    if (pair[1]) {
      value = progn(pair[1]);
    }

    if (value) {
      return [variable, value];
    } else {
      return [variable];
    }
  });

  return ["var", processedArgs];
};

// MAIN

var progn = function(tree) {
  switch (tree.type) {
    case 'funcall':
      var f = tree.function;
      var processedArgs;
      var body;
      var pairs;

      var args = tree.arguments;
      if (args.type !== 'list') {
        throw new Error('arguments should be a list');
      }
      args = args.contents;

      if (f.type === 'id') {
        if (f.contents === ';') {
          if (args.length !== 1 || args[0].type !== 'string') {
            throw new Error("comments can only take one argument: a string");
          }

          var str = args[0].contents;
          return ['comment', str];
        } else if (f.contents === 'lambda' || f.contents === 'function') {
          var formalArgs = _.map(car(args).contents, function(arg) {
            return arg.contents;
          });

          body = processBody(car(cdr(args)).contents);
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
          return ["unary-prefix", f.contents, progn(args[0])];
        } else if (f.contents === 'return') {
          if (args.length > 1) {
            throw new Error("Return must take 0 or 1 arguments");
          }

          processedArgs = args.length === 0 ? null : progn(args[0]);
          return ['return', processedArgs];
        } else if (f.contents === 'var') {
          args = _.map(args, function(pair) {
            // should be seen as a function, so normalize args:
            var name = pair.function;
            var value = pair.arguments.contents;

            return [name, value];
          });

          return _var(args);
        } else if (f.contents === 'define') {
          pairs = [];
          _.inGroupsOf(args, 2, function(pair) {
            var array = [pair[0], [pair[1]]];
            pairs.push(array);
          });

          return _var(pairs);
        } else if (f.contents === 'debugger') {
          if (args.length > 0) {
            throw new Error("debugger can not take any arguments");
          }
          return ['name', 'debugger'];
        } else if (f.contents === 'if') {
          var condition = args.shift();
          body = args;

          condition = progn(condition);

          body = processBody(args);

          return ['if', condition, ['block', body]];
        } else if (f.contents === '{}') {
          pairs = [];
          _.inGroupsOf(args, 2, function(pair) {
            if (pair[0].type !== 'id') {
              throw new Error("{} can only take can only have static variable names");
            }

            var key = pair[0].contents;
            var value = progn(pair[1]);

            pairs.push([key, value]);
          });

          return ['object', pairs];
        } else if (f.contents === '[]') {
          return ['array', _.map(args, progn)];
        } else if (f.contents === '=') {
          if (args.length !== 2) {
            throw new Error("wrong number of arguments for assignment (calling =)");
          }

          return ['assign', true, progn(args[0]), progn(args[1])];
        } else if (f.contents === 'new') {
          if (args.length === 0) {
            throw new Error("Must give name of prototype to new");
          }

          var name = args.shift();

          return ['new', progn(name), processArguments(args)];
        } else if (f.contents === 'try') {
          //TODO: Implement finally clause
          var catchArg = args.pop();

          if (catchArg.type !== 'funcall') {
            throw new Error('invalid syntax in try/catch');
          }

          if (catchArg.function.type !== 'id' ||
              catchArg.function.contents !== 'catch') {
            throw new Error("invalid syntax with try/catch. Must have form (try statements ... (catch error statements ...))");
          }

          var tryBody = processBody(args);

          var catchParts = catchArg.arguments;
          if (catchParts.type !== 'list') {
            throw new Error('Unknown error in try/catch');
          }
          catchParts = catchParts.contents;

          var catchError = catchParts.shift();
          if (catchError.type !== 'id') {
            throw new Error('variable given to catch must be an id (cannot be dynamic)');
          }
          catchError = catchError.contents;

          var catchBody = processBody(catchParts);

          var finallBody = null;

          return ['try', tryBody, [catchError, catchBody], finallBody];
        } else if (f.contents === 'for') {
          var forArgs = args.shift();

          if (forArgs.type !== 'funcall') {
            throw new Error("malformed for statement");
          }

          var initializer  = progn(forArgs.function);
          var test         = progn(forArgs.arguments.contents[0]);
          var counter      = progn(forArgs.arguments.contents[1]);
          body             = processBody(args);

          return ['for', initializer, test, counter, ['block', body]];
        } else if (f.contents === 'switch') {
          var switchCondition = args.shift();
          var switchTests = args;

          switchCondition = progn(switchCondition);
          switchTests = _.map(switchTests, function(caseExpr) {
            if (caseExpr.type !== 'funcall') {
              throw new Error("malformed case statement!");
            }

            var args = caseExpr.arguments;
            if (args.type !== 'list') {
              throw new Error('case expression malformed; Should be (case condition statements...)');
            }
            args = args.contents;

            var caseOrDefault = caseExpr.function;

            if (caseOrDefault.type !== 'id') {
              throw new Error('malformed switch statement.  Must contain either (case ...) or (default ...)');
            }

            var condition = null,
                statements;

            if (caseOrDefault.contents === 'case') {
              condition = args.shift();
              statements = args;

              condition = progn(condition);
              statements = _.map(statements, function(statement) {
                return processStatementOrExpression(statement);
              });
            } else if (caseOrDefault.contents === 'default') {
              statements = _.map(args, function(statement) {
                return processStatementOrExpression(statement);
              });
            } else {
              throw new Error('malformed switch statement.  Must contain either (case ...) or (default ...)');
            }

            return [condition, statements];
          });

          return [ "switch", switchCondition, switchTests];
        } else if (f.contents === 'break') {
          return [ 'break', null ];
        } else {
          return ['call', progn(f), processArguments(args)];
        }
      } else if (f.type === 'funcall') {
        return ['call', progn(f), processArguments(args)];
      } else if (f.type === 'prop-access') {
        return ['call', progn(f), processArguments(args)];
      } else {
        throw new Error('not a function, id, or prop access in function position');
      }
    case 'prop-access':
      // TODO: support dynamic value types (?)
      if (tree.value.type !== 'id') {
        throw new Error("Invalid property access - looking for computed value");
      }

      return ['dot', progn(tree.key), tree.value.contents];
    case 'id':
      return ['name', tree.contents];
    case 'string':
      return ['string', tree.contents];
    case 'number':
      return ['num', tree.contents];
    default:
      throw new Error("Don't know how to process tree: " + JSON.stringify(tree));
  }
};

processStatementOrExpression = function(statementOrExpression) {
  switch (statementOrExpression.type) {
    case 'id':
    case 'string':
    case 'prop-access':
    case 'number':
      return stmt(progn(statementOrExpression));
    case 'funcall':
      var f = statementOrExpression.function;

      var isStatement = true;

      if (f.type === 'id' &&
          (f.contents === 'var' ||
           f.contents === 'if' ||
           f.contents === '//')) {
        isStatement = false;
      }

      var expr = progn(statementOrExpression);
      return isStatement ? stmt(expr) : expr;
    default:
      throw new Error("Unknown statement or expression type: ", JSON.stringify(statementOrExpression));
  }
};

exports.transform = function(statements, options) {
  var statementsOrExpressions = [];
  var source_tracking = false;

  if (!options) {
    options = {};
  }

  if (options.source_tracking) {
    source_tracking = options.source_tracking;
  }

  _.each(statements, function(statement) {
    if (source_tracking) {
      if (statement && statement.function && statement.function.sourceInfo) {
        var sourceInfo = statement.function.sourceInfo;
        var commentStr = 'line ' + sourceInfo.first_line + ", " + 'column ' + sourceInfo.first_column;

        statementsOrExpressions.push(['comment', commentStr]);
      }
    }

    statementsOrExpressions.push(processStatementOrExpression(statement));
  });

  return [
    'toplevel',
    statementsOrExpressions
  ];
};

module.exports = exports;