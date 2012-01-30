var _ = require('./underscore');
var CodeFormatter = require('./code-formatter').codeFormatter;

var treeInspector = {};

treeInspector.fullInfo = function(tree) {
  return require('util').inspect(tree, null, 20);
};

(function() {
  var writeLine = function(tree, formatter) {
    formatter.column(1, function() {
      var sourceInfo = tree.sourceInfo;

      var str = '';

      if (sourceInfo.first_line === sourceInfo.last_line) {
        str += sourceInfo.first_line + ":" + sourceInfo.first_column;
        str += '-';
        str += sourceInfo.last_column;
      } else {
        str += sourceInfo.first_line + ":" + sourceInfo.first_column;
        str += ' - ';
        str += sourceInfo.last_line + ":" + sourceInfo.last_column;
      }

      formatter.append(str);
    });
  };

  var writeNewline = function(formatter) {
    formatter.columns(1, 2, function() {
      formatter.newline();
    });
  };

  var withLineNumbers;
  withLineNumbers = function(tree, formatter, isLast) {
    if (typeof formatter === 'undefined') {
      formatter = new CodeFormatter();
      writeNewline(formatter);
    }

    formatter.column(2, function() {
      if (tree.type === 'list') {
        var anyLists = _.any(tree.contents, function(el) {
          return el.type === 'list';
        });

        if (anyLists) {
          writeLine(tree, formatter);

          formatter.append('[');
          writeNewline(formatter);

          formatter.indent(function() {
            _.eachWithLastBool(tree.contents, function(el, index, isLast) {
              withLineNumbers(el, formatter, isLast);
              writeNewline(formatter);
            });
          });

          formatter.append(']');
        } else {
          formatter.append('[');
          _.eachWithLastBool(tree.contents, function(el, index, isLast) {
            withLineNumbers(el, formatter, isLast);
          });
          formatter.append(']');

          writeNewline(formatter);
        }
      } else {
        formatter.append(tree.contents);

        if (!isLast) {
          formatter.ws();
        }
      }
    });

    return formatter.toString();
  };

  treeInspector.withLineNumbers = withLineNumbers;
}());


module.exports = treeInspector;