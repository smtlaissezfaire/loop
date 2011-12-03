%lex
%%

\s+                   /* skip whitespace */
"("                  return "OPEN_PAREN";
")"                  return "CLOSE_PAREN";
[a-z\=\*\/\+\-\.]+   return "SYMBOL";
[0-9]+               return "INT";
\.+                  return "PERIOD";

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
  : list { $$ = $1; }
  | atom { $$ = $1; }
;

list
  : OPEN_PAREN list-members CLOSE_PAREN %{
    $$ = require(__dirname + "/loop/transformers").makeList($2);
  }
  | OPEN_PAREN CLOSE_PAREN %{
    $$ = require(__dirname + "/loop/transformers").makeList([]);
  }
;

list-members
  : list-members s-expression { $$ = $1.concat($2); }
  | s-expression { $$ = [$1]; }
;

atom
  : INT     { $$ = require(__dirname + "/loop/transformers").makeNumber($1); }
  | SYMBOL  { $$ = require(__dirname + "/loop/transformers").makeSymbol($1); }
;
