%lex
%%

\s+                   /* skip whitespace */
"("                  return "OPEN_PAREN";
")"                  return "CLOSE_PAREN";
[a-z\=]+             return "SYMBOL";
[0-9]+               return "INT";
\.+                  return "PERIOD";

/lex

%start s-expression
%%

s-expression
  : atom { return $1; }
  | list { return $1; }
;

list
  : OPEN_PAREN atoms CLOSE_PAREN %{
    $$ = require(__dirname + "/loop/transformers").makeList($2);
  }
;

atoms
  : atoms atom { $$ = $1.concat($2) }
  | atom { $$ = [$1] }
;

atom
  : INT     { $$ = require(__dirname + "/loop/transformers").makeNumber($1); }
  | SYMBOL  { $$ = require(__dirname + "/loop/transformers").makeSymbol($1); }
;


