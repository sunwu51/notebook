grammar Calc;
@header {
  package com.example.calc;
}
// 程序由多个语句组成
program: statement+ ;

// 语句由很多种
statement
    : varStatement
    | returnStatement
    | blockStatement
    | ifStatement
    | forStatement
    | breakStatement
    | continueStatement
    | throwStatement
    | tryCatchStatement
    | classStatement
    | expresstionStatement
    ;

varStatement: 'var' IDENTIFIER '=' expression ';' ;

returnStatement: 'return' expression ';' ;
throwStatement: 'throw' expression ';';

expresstionStatement: expression ';' ;

blockStatement: '{' statement* '}' ;

ifStatement: 'if' '(' cond=expression ')' ifBody = blockStatement ('else' elseBody=blockStatement)? ;

forStatement: 'for' '(' init=statement cond=statement step=expression ')' body=blockStatement;

breakStatement: 'break' ';';

continueStatement: 'continue' ';';

tryCatchStatement: 'try' blockStatement 'catch' '(' IDENTIFIER ')' blockStatement;

classStatement: 'class' IDENTIFIER ('extends' IDENTIFIER)? '{' (IDENTIFIER ('=' expression)? ';')*   '}';


expression
    : assignExpression;

assignExpression
    : andExpression # AndInAssign
    | left=andExpression op=ASSGIN right=assignExpression # Assign
    ;

andExpression
    : eqExpression # EqInAnd
    | left=andExpression op=(AND|OR) right=eqExpression # And
    ;

eqExpression
    : compExpression    # CompInEq
    | left=eqExpression op=(EQ|NEQ) right=compExpression # Eq
    ;

compExpression
    : additionExpression # AddInComp
    | left=compExpression op=(LTE|GTE|LT|GT) right=additionExpression # Comp
    ;

additionExpression
    : multiplicationExpression                                          # MulInAdd
    | left = additionExpression op=(PLUS|MINUS) right = multiplicationExpression       # Add
    ;

multiplicationExpression
    : prefixExpression                                                          # PreInMul
    | left = multiplicationExpression op=(MULTIPLY|DIVIDE|MODULUS) right = prefixExpression    # Mul
    ;

prefixExpression
    : postfixExpression                                                       # PostfixInPrefix
    | op=(PLUS|MINUS|NOT|BNOT|INCREMENT|DECREMENT) right=postfixExpression    # Prefix
    ;

postfixExpression
    : functionCallExpression                                             # FunCallInPost
    | left=functionCallExpression  op=(INCREMENT|DECREMENT)              # Postfix
    ;

functionCallExpression
    : pointExpression                                                    # PointInFunCall
    | funcIter=pointExpression '(' (expression','? )* ')'                # FunCall
    ;
// 点运算符优先级比后缀运算符还要高是一个比较特殊的中缀运算符，例如a.age++ => (a.age) ++
pointExpression
    : unaryExpression                          # UnaryInPoint
    | unaryExpression '.' IDENTIFIER           # Point
    | unaryExpression '[' expression ']'       # Index
    ;


unaryExpression
    : unary # UnaryWrapper
    ;
unary
    : NUMBER    #Number
    | STRING    #String
    | NULL      #Null
    | TRUE      #True
    | FALSE     #False
    | IDENTIFIER#Ident
    | group     #Gro
    | array     #ArrInUnary
    | object    #ObjInUnary
    | function  #FunInUnary
    | new       #NewInUnary
;

group: '(' expression ')';
array
    : '[' (expression','?)* ']'
    ;
object: '{' pair (',' pair)* '}' ;
pair: key=(STRING | IDENTIFIER) ':' value=expression ;

function: FUNCTION '(' params ')' blockStatement;
params: (IDENTIFIER (',' IDENTIFIER)*)?;
new: NEW IDENTIFIER '(' (expression (',' expression)*)? ')';

NULL: 'null';
TRUE: 'true';
FALSE: 'false';
NEW: 'new';
FUNCTION: 'function';
INCREMENT: '++';
DECREMENT: '--';
PLUS: '+';
MINUS: '-';
BNOT: '~';
EQ: '==';
ASSGIN: '=';
MULTIPLY: '*';
DIVIDE: '/';
MODULUS: '%';
POINT: '.';
OR: '||';
BOR: '|';
AND: '&&';
BAND: '&';
NEQ: '!=';
NOT: '!';
LTE: '<=';
LT: '<';
GTE: '>=';
GT: '>';


NUMBER: [0-9]+('.' [0-9]+)? ;
STRING: ('"' ( ~["\\] | '\\' . )* '"') | ('\'' ( ~['\\] | '\\' . )* '\'');
IDENTIFIER: [a-zA-Z_][a-zA-Z_0-9]* ;

EMPTY: [\t\r\n ]+ -> skip;
// 单行注释
LINE_COMMENT: '//' ~[\r\n]* -> skip ;
// 多行注释
BLOCK_COMMENT: '/*' .*? '*/' -> skip ;
