%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum TokenType {
    // 关键字
    VAR = 1, FUNCTION, RETURN, IF, ELSE, WHILE,
    
    // 标识符和常量
    IDENTIFIER, NUMBER, BOOLEAN,
    
    // 运算符
    PLUS, MINUS, MULTIPLY, DIVIDE, MODULO,
    ASSIGN, PLUS_ASSIGN, MINUS_ASSIGN, MULTIPLY_ASSIGN, DIVIDE_ASSIGN,
    
    // 比较运算符
    EQUAL, NOT_EQUAL, LESS_THAN, GREATER_THAN, 
    LESS_OR_EQUAL, GREATER_OR_EQUAL,
    
    // 逻辑运算符
    LOGICAL_AND, LOGICAL_OR, LOGICAL_NOT,
    
    // 位运算符
    BITWISE_AND, BITWISE_OR, BITWISE_XOR, 
    BITWISE_NOT, LEFT_SHIFT, RIGHT_SHIFT,
    
    // 分隔符
    LPAREN, RPAREN, LBRACE, RBRACE, 
    LBRACKET, RBRACKET, COMMA, SEMICOLON,
    
    // 其他
    ERROR
};
%}

%option noyywrap

DIGIT       [0-9]
LETTER      [a-zA-Z_]
IDENTIFIER  {LETTER}({LETTER}|{DIGIT})*
NUMBER      ({DIGIT}+("."{DIGIT}+)?)|("."{DIGIT}+)
BOOLEAN     "true"|"false"

%%

"var"       { printf("KEYWORD: var\n"); return VAR; }
"function"  { printf("KEYWORD: function\n"); return FUNCTION; }
"return"    { printf("KEYWORD: return\n"); return RETURN; }
"if"        { printf("KEYWORD: if\n"); return IF; }
"else"      { printf("KEYWORD: else\n"); return ELSE; }
"while"     { printf("KEYWORD: while\n"); return WHILE; }

{BOOLEAN}   { 
    printf("BOOLEAN: %s\n", yytext); 
    return BOOLEAN; 
}


{IDENTIFIER} { 
    printf("IDENTIFIER: %s\n", yytext); 
    return IDENTIFIER; 
}

{NUMBER}    { 
    // 判断是整数还是浮点数
    if (strchr(yytext, '.') != NULL) {
        printf("NUMBER (FLOAT): %s\n", yytext);
    } else {
        printf("NUMBER (INTEGER): %s\n", yytext);
    }
    return NUMBER; 
}


","         { printf("DELIMITER: ,\n"); return COMMA; }

"+"         { printf("ARITHMETIC: +\n"); return PLUS; }
"-"         { printf("ARITHMETIC: -\n"); return MINUS; }
"*"         { printf("ARITHMETIC: *\n"); return MULTIPLY; }
"/"         { printf("ARITHMETIC: /\n"); return DIVIDE; }
"%"         { printf("ARITHMETIC: %\n"); return MODULO; }

"=="        { printf("COMPARISON: ==\n"); return EQUAL; }
"!="        { printf("COMPARISON: !=\n"); return NOT_EQUAL; }
"<"         { printf("COMPARISON: <\n"); return LESS_THAN; }
">"         { printf("COMPARISON: >\n"); return GREATER_THAN; }
"<="        { printf("COMPARISON: <=\n"); return LESS_OR_EQUAL; }
">="        { printf("COMPARISON: >=\n"); return GREATER_OR_EQUAL; }

"&&"        { printf("LOGICAL: &&\n"); return LOGICAL_AND; }
"||"        { printf("LOGICAL: ||\n"); return LOGICAL_OR; }
"!"         { printf("LOGICAL: !\n"); return LOGICAL_NOT; }

"&"         { printf("BITWISE: &\n"); return BITWISE_AND; }
"|"         { printf("BITWISE: |\n"); return BITWISE_OR; }
"^"         { printf("BITWISE: ^\n"); return BITWISE_XOR; }
"~"         { printf("BITWISE: ~\n"); return BITWISE_NOT; }
"<<"        { printf("BITWISE: <<\n"); return LEFT_SHIFT; }
">>"        { printf("BITWISE: >>\n"); return RIGHT_SHIFT; }

"("         { printf("DELIMITER: (\n"); return LPAREN; }
")"         { printf("DELIMITER: )\n"); return RPAREN; }
"{"         { printf("DELIMITER: {\n"); return LBRACE; }
"}"         { printf("DELIMITER: }\n"); return RBRACE; }
"["         { printf("DELIMITER: [\n"); return LBRACKET; }
"]"         { printf("DELIMITER: ]\n"); return RBRACKET; }

"="         { printf("ASSIGNMENT: =\n"); return ASSIGN; }
"+="        { printf("ASSIGNMENT: +=\n"); return PLUS_ASSIGN; }
"-="        { printf("ASSIGNMENT: -=\n"); return MINUS_ASSIGN; }
"*="        { printf("ASSIGNMENT: *=\n"); return MULTIPLY_ASSIGN; }
"/="        { printf("ASSIGNMENT: /=\n"); return DIVIDE_ASSIGN; }

";"         { printf("DELIMITER: ;\n"); return SEMICOLON; }

{NUMBER}[eE][-+]?{DIGIT}+ {
    printf("NUMBER (SCIENTIFIC): %s\n", yytext);
    return NUMBER;
}

[ \t\n\r]+  { /* 忽略空白 */ }

"//".*      { /* 单行注释 */ }
"/*"([^*]|\*+[^*/])*\*+"/"  { /* 多行注释 */ }

.           { 
    printf("Unexpected character: %s\n", yytext); 
    return ERROR; 
}

%%

int main(int argc, char **argv) {
    if (argc > 1) {
        if (!(yyin = fopen(argv[1], "r"))) {
            perror(argv[1]);
            return 1;
        }
    }
    
    int token;
    while ((token = yylex()) != 0) {
        // 可以根据需要处理每个 token
    }
    
    return 0;
}
