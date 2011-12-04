var _ = require('underscore');
var helpers = require('./helpers');
var car = helpers.car;
var cdr = helpers.cdr;

var loopEval = function(syntaxTree) {
  switch (syntaxTree.type) {
    case 'list':
      var contents = syntaxTree.contents;

      if (contents.length === 0) {
        throw new Error("list of length 0!");
      }

      var firstToken = car(contents);
      var remainingTokens = cdr(contents);

      if (firstToken.type === 'list') {
        return {
          type: 'funcall',
          function: loopEval(car(contents)),
          arguments: {
            type: 'list',
            contents: []
          } // TODO: process cdr(contents)
        };
      }

      var body;

      if (firstToken.type === 'id') {
        if (firstToken.contents === 'lambda') {
          var formalArgs = car(remainingTokens);
          var bodyNodes = cdr(remainingTokens);
          body = _.map(bodyNodes, function(node) {
            return loopEval(node);
          });

          return {
            type: 'funcall',
            function: firstToken,
            arguments: {
              type: 'list',
              contents: [
                formalArgs,
                {
                  type: 'list',
                  contents: body
                }
              ]
            }
          };
        } else { // user defined or built in function
          body = _.map(remainingTokens, function(token) {
            return loopEval(token);
          });

          return {
            type: 'funcall',
            function: firstToken,
            arguments: {
              type: 'list',
              contents: body
            }
          };
        }
      }

      throw new Error("unknown error - not sure what to do here.  Bailing");
    case 'id':
      return syntaxTree;
    default:
      throw new Error('unknown type of syntaxTree, type: ' + syntaxTree.type);
  }
};

module.exports = function(branches) {
  return _.map(branches, function(branch) {
    return loopEval(branch);
  });
};