var _ = require('underscore');

var outputBuffer = function(options) {
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
};

outputBuffer.prototype.indentWithWhitespace = function() {
  var out = "";
  var i;

  for (i = 1; i <= this.currentIndentationLevel; i++) {
    out += this.indentationMark.toString();
  }

  return out;
};

outputBuffer.prototype.toString = function() {
  return this.out;
};

outputBuffer.prototype.append = function(str) {
  if (this.isNewLine) {
    this.out += this.indentWithWhitespace();
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

outputBuffer.prototype.ws = function(num) {
  this.out += ws(num);
};

outputBuffer.prototype.newline = function() {
  this.isNewLine = true;
  this.out += '\n';
};

outputBuffer.prototype.indent = function(code) {
  this.currentIndentationLevel += 1;

  if (code) {
    code();
    this.outdent();
  }
};

outputBuffer.prototype.outdent = function() {
  if (this.currentIndentationLevel < 1) {
    this.currentIndentationLevel = 0;
    return;
  }

  this.currentIndentationLevel -= 1;
};

/////////////////////

var codeFormatter = function(options) {
  this.outputBufferIndex = 0;
  this.outputBuffers = [new outputBuffer(options)];

  this.currentOutputBuffer = function() {
    var buffer = this.outputBuffers[this.outputBufferIndex];

    if (!buffer) {
      buffer = new outputBuffer(options);
      this.outputBuffers[this.outputBufferIndex] = buffer;
    }

    return buffer;
  };

  // proxy current output buffer
  var self = this;
  _.each(outputBuffer.prototype, function(val, key) {
    if (typeof val === 'function') {
      self[key] = function() {
        var buffer = this.currentOutputBuffer();
        return buffer[key].apply(buffer, arguments);
      };
    }
  });

  this.column = function(columnNumber, fn) {
    var oldIndex = this.outputBufferIndex;
    this.outputBufferIndex = columnNumber - 1;
    fn();
    this.outputBufferIndex = oldIndex;
  };

  this.columns = function() {
    var args = _.toArray(arguments);
    var fn = args.pop();

    var self = this;
    _.each(args, function(arg) {
      self.column(arg, fn);
    });
  };

  this.toString = function() {
    if (this.outputBuffers.length === 1) {
      return this.outputBuffers[0].toString();
    }

    var out = '';

    // find column width for each outputBuffer
    var widths = _.map(this.outputBuffers, function(buffer) {
      var lengths = _.map(buffer.toString().split('\n'), function(line) {
        return line.length;
      });

      return Math.max.apply(this, lengths);
    });

    // find longest line in all of the buffers
    var bufferLineCounts = _.map(this.outputBuffers, function(buffer) {
      return buffer.toString().split('\n').length;
    });
    var longestLine = Math.max.apply(this, bufferLineCounts);

    var self = this;

    _.fromUpto(1, longestLine, function(lineno) {
      var lineOut = '';

      _.eachWithLastBool(self.outputBuffers, function(buffer, index, isLast) {
        var bufferOut = buffer.toString().split('\n')[lineno-1];

        if (typeof bufferOut === 'undefined') {
          bufferOut = '';
        }

        if (bufferOut.length < widths[index]) {
          bufferOut += ws(widths[index] - bufferOut.length);
        }

        lineOut += bufferOut;

        if (!isLast) {
          lineOut += ' | ';
        }
      });

      out += lineOut;

      if (lineno !== longestLine) {
        out += '\n';
      }
    });

    return out;
  };
};

exports.codeFormatter = codeFormatter;
