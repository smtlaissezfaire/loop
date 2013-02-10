%lex
%%

";".*                                                   return "COMMENT";
\"(\\.|[^\\"])*\"                                       return "STRING";
\'(\\.|[^\\'])*\'                                       return "STRING";
\s+                                                     /* skip whitespace */
\n+                                                     /* skip newlines */
\r+                                                     /* same */
"..."                                                   return "MACRO_PATTERN";
"."                                                     return "DOT";
"("                                                     return "OPEN_PAREN";
")"                                                     return "CLOSE_PAREN";
"{"                                                     return "OPEN_BRACE";
"}"                                                     return "CLOSE_BRACE";
"["                                                     return "OPEN_BRACKET";
"]"                                                     return "CLOSE_BRACKET";
","                                                     return "COMMA";
[0-9]+                                                  return "INT";
([^\(\)\s\n\r])+                                        return "SYMBOL";

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
  | object-literal  { $$ = $1; }
  | array-literal   { $$ = $1; }
  | property-access { $$ = $1; }
  | atom            { $$ = $1; }
  | comment         { $$ = $1; }
;

list
  : OPEN_PAREN list-members CLOSE_PAREN %{
    $$ = require("./grammar/token-builders").makeList($2, @2);
  }
  | OPEN_PAREN CLOSE_PAREN %{
    $$ = require("./grammar/token-builders").makeList([], @1);
  }
;

object-literal
  : OPEN_BRACE list-members CLOSE_BRACE {
    $$ = require("./grammar/token-builders").makeObjectLiteral($2, @2);
  }
  | OPEN_BRACE CLOSE_BRACE {
    $$ = require("./grammar/token-builders").makeObjectLiteral(null, @1);
  }
;

array-literal
  : OPEN_BRACKET list-members CLOSE_BRACKET {
    $$ = require("./grammar/token-builders").makeArrayLiteral($2, @2);
  }
  | OPEN_BRACKET CLOSE_BRACKET {
    $$ = require("./grammar/token-builders").makeArrayLiteral(null, @1);
  }
;


list-members
  : list-members s-expression COMMA  { $$ = $1.concat($2); }
  | list-members COMMA s-expression  { $$ = $1.concat($3); }
  | list-members s-expression        { $$ = $1.concat($2) }
  | s-expression                     { $$ = [$1]; }
;

property-access
  : s-expression DOT s-expression {
    $$ = require("./grammar/token-builders").makePropertyAccess($1, $3, @1);
  }
;

float
  : INT DOT INT {
    $$ = require("./grammar/token-builders").makeNumber($1, $3, @1);
  }
;

atom
  : MACRO_PATTERN { $$ = require("./grammar/token-builders").makeMacroPattern(@1); }
  | float         { $$ = $1; }
  | INT           { $$ = require("./grammar/token-builders").makeNumber($1, @1); }
  | STRING        { $$ = require("./grammar/token-builders").makeString($1, @1); }
  | SYMBOL        { $$ = require("./grammar/token-builders").makeSymbol($1, @1); }
;

comment
  : COMMENT { $$ = require("./grammar/token-builders").makeComment($1, @1); }
;