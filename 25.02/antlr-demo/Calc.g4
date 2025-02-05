grammar Calc;		
prog:	expr EOF ;
expr
    : expr op=(MUL|DIV) expr    # MulDiv
    | expr op=(ADD|SUB) expr    # AddSub
    | INT                       # Int
    | '(' expr ')'              # Parens
    ;
NEWLINE : [\r\n ]+ -> skip;
INT     : [0-9]+ ;

ADD: '+';
SUB: '-';
MUL: '*';
DIV: '/';