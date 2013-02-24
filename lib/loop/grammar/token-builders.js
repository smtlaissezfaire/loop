var tokenBuilders = {};

tokenBuilders.makeList = function(contents, sourceInfo) {
  return {
    type: 'list',
    contents: contents,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeComment = function(comment, sourceInfo) {
  return {
    type: 'comment',
    contents: comment.slice(2).trim(),
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeSymbol = function(symbol, sourceInfo) {
  return {
    type: 'id',
    contents: symbol,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeNumber = function(intPart, fractionalPart, sourceInfo) {
  var str = intPart;
  if (fractionalPart) {
    str += "." + fractionalPart;
  }

  var num = parseFloat(str);

  return {
    type: 'number',
    contents: num,
    sourceInfo: sourceInfo
  };
};

tokenBuilders.parseString = function(string) {
  var i;
  var ch;
  var newStr = '';

  // remove quotes
  string = string.slice(1, -1);

  for (i = 0; i < string.length; i++) {
    ch = string[i];

    // escape double backslashes
    if (ch === '\\') {
      i++;
      ch = string[i];

      switch (ch) {
        // taken from uglify
        case "n" : newStr += "\n"; break;
        case "r" : newStr += "\r"; break;
        case "t" : newStr += "\t"; break;
        case "b" : newStr += "\b"; break;
        case "v" : newStr += "\u000b"; break;
        case "f" : newStr += "\f"; break;
        // case "0" : newStr += "\0"; break;
        case "x" : newStr += String.fromCharCode(hex_bytes(2)); break;
        case "u" : newStr += String.fromCharCode(hex_bytes(4)); break;
        // case "\n": newStr += ""; break;
      }
    } else {
      newStr += ch;
    }
  }

  return newStr;
};

tokenBuilders.makeString = function(str, sourceInfo) {
  return {
    type: 'string',
    contents: tokenBuilders.parseString(str),
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeRegexp = function(str, sourceInfo) {
  str = str.slice(1);
  var parts = str.split("/");
  var regexPart = parts[0];
  var modifiers = parts[1];

  return {
    type: 'regexp',
    contents: {
      regex: regexPart,
      modifiers: modifiers
    },
    sourceInfo: sourceInfo
  };
};

tokenBuilders.makeObjectLiteral = function(listMembers, sourceInfo) {
  if (listMembers) {
    var list = [];
    list.push(this.makeSymbol("{}", sourceInfo));
    var i;
    for (i = 0; i < listMembers.length; i++) {
      var listMember = listMembers[i];
      list.push(listMember);
    }
    return this.makeList(list, sourceInfo);
  } else {
    return this.makeSymbol("{}", sourceInfo);
  }
};

tokenBuilders.makeArrayLiteral = function(listMembers, sourceInfo) {
  if (listMembers) {
    var list = [];
    list.push(this.makeSymbol("[]", sourceInfo));
    var i;
    for (i = 0; i < listMembers.length; i++) {
      var listMember = listMembers[i];
      list.push(listMember);
    }
    return this.makeList(list, sourceInfo);
  } else {
    return this.makeSymbol("[]", sourceInfo);
  }
};

tokenBuilders.makePropertyAccess = function(key, value, sourceInfo) {
  return {
    type: 'prop-access',
    contents: {
      key: key,
      value: value,
      sourceInfo: sourceInfo
    }
  };
};

tokenBuilders.makeMacroPattern = function(sourceInfo) {
  return {
    type: 'macro-pattern',
    sourceInfo: sourceInfo
  };
};

module.exports = tokenBuilders;