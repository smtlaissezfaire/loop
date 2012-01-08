var _ = require('underscore');

var codeFormatter = function(options) {
  if (!options) {
    options = {};
  }

  var defaultOptions = {
    currentIndentationLevel: 0,
    indentationMark: '  ' // default: two space indentation
  };
  options = _.extend(defaultOptions, options);

  this.out = '';
  this.isNewLine = true;
  this.currentIndentationLevel = options.currentIndentationLevel;
  this.indentationMark = options.indentationMark;

  var self = this;

  var indentWithWhitespace = function() {
    var out = '';
    var i;

    for (i = 1; i <= self.currentIndentationLevel; i++) {
      out += self.indentationMark;
    }

    return out;
  };

  this.toString = function() {
    return this.out;
  };

  this.append = function(str) {
    if (this.isNewLine) {
      this.out += indentWithWhitespace();
    }

    this.out += str;
    this.isNewLine = false;
  };

  var ws = function(num) {
    if (!num) {
      num = 1;
    }

    if (typeof num !== 'number') {
      throw new Error("Invalid number given to ws();");
    }

    if (num < 0) {
      throw new Error("argument to ws() must be 0 or above");
    }

    var out = '';
    var i;

    for (i = 1; i <= num; i++) {
      out += ' ';
    }

    return out;
  };

  this.ws = function(num) {
    this.out += ws(num);
  };

  this.newline = function() {
    this.isNewLine = true;
    this.out += '\n';
  };

  this.indent = function() {
    this.currentIndentationLevel += 1;
  };

  this.outdent = function() {
    if (this.currentIndentationLevel < 1) {
      this.currentIndentationLevel = 0;
      return;
    }

    this.currentIndentationLevel -= 1;
  };
};

exports.codeFormatter = codeFormatter;
