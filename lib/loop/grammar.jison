%lex
%%

"//"+.*                 /* skip comments */
\"(\\.|[^\\"])*\"       return "STRING";
\s+                     /* skip whitespace */
\n+                     /* skip newlines */
\r+                     /* same */
"."                     return "PROP_ACCESS";
"("                     return "OPEN_PAREN";
")"                     return "CLOSE_PAREN";
[a-zA-Z\=\*\/\+\-]+     return "SYMBOL";
[0-9]+                  return "INT";
\.+                     return "PERIOD";

/lex

%start program
%%

program
  : prog { return $1; }
;

prog
  : prog s-expression { $$ = $1.concat($2); }
  | s-expression      { $$ = [$1]; }
;

s-expression
  : list            { $$ = $1; }
  | property-access { $$ = $1; }
  | atom            { $$ = $1; }
;

list
  : OPEN_PAREN list-members CLOSE_PAREN %{
    $$ = require("./grammar/token-builders").makeList($2);
  }
  | OPEN_PAREN CLOSE_PAREN %{
    $$ = require("./grammar/token-builders").makeList([]);
  }
;

list-members
  : list-members s-expression { $$ = $1.concat($2); }
  | s-expression { $$ = [$1]; }
;

property-access
  : s-expression PROP_ACCESS s-expression {
    $$ = require("./grammar/token-builders").makePropertyAccess($1, $3);
  }
;

atom
  : INT     { $$ = require("./grammar/token-builders").makeNumber($1); }
  | STRING  { $$ = require("./grammar/token-builders").makeString($1); }
  | SYMBOL  { $$ = require("./grammar/token-builders").makeSymbol($1); }
;
