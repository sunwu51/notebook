package lexer;

%%

%class Lexer
%type Token
%line
%column
%unicode

%{
    public static class Token {
        public enum Type {
            VAR, FUNCTION, RETURN, IF, ELSE, WHILE,
            
            IDENTIFIER, NUMBER, BOOLEAN,
            
            PLUS, MINUS, MULTIPLY, DIVIDE, MODULO,
            ASSIGN, PLUS_ASSIGN, MINUS_ASSIGN, MULTIPLY_ASSIGN, DIVIDE_ASSIGN,
            
            EQUAL, NOT_EQUAL, LESS_THAN, GREATER_THAN, 
            LESS_OR_EQUAL, GREATER_OR_EQUAL,
            
            LOGICAL_AND, LOGICAL_OR, LOGICAL_NOT,
            
            BITWISE_AND, BITWISE_OR, BITWISE_XOR, 
            BITWISE_NOT, LEFT_SHIFT, RIGHT_SHIFT,
            
            LPAREN, RPAREN, LBRACE, RBRACE, 
            LBRACKET, RBRACKET, COMMA, SEMICOLON,
            
            ERROR, EOF
        }

        public Type type;
        public String value;
        public int line;
        public int column;

        public Token(Type type, String value, int line, int column) {
            this.type = type;
            this.value = value;
            this.line = line;
            this.column = column;
        }

        @Override
        public String toString() {
            return String.format("%s: %s (Line: %d, Column: %d)", 
                type, value, line, column);
        }
    }

    private void log(String category, String value) {
        System.out.printf("%s: %s\n", category, value);
    }
%}

DIGIT       = [0-9]
LETTER      = [a-zA-Z_]
IDENTIFIER  = {LETTER}({LETTER}|{DIGIT})*
NUMBER      = ({DIGIT}+("."{DIGIT}+)?)|("."{DIGIT}+)
SCIENTIFIC_NUMBER = {NUMBER}[eE][-+]?{DIGIT}+
BOOLEAN     = "true"|"false"
WHITESPACE  = [ \t\n\r]+
SINGLE_COMMENT = "//".*
MULTI_COMMENT = "/*"([^*]|\*+[^*/])*\*+"/"

%%
"var"       { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.VAR, yytext(), yyline, yycolumn); 
}
"function"  { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.FUNCTION, yytext(), yyline, yycolumn); 
}
"return"    { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.RETURN, yytext(), yyline, yycolumn); 
}
"if"        { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.IF, yytext(), yyline, yycolumn); 
}
"else"      { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.ELSE, yytext(), yyline, yycolumn); 
}
"while"     { 
    log("KEYWORD", yytext());
    return new Token(Token.Type.WHILE, yytext(), yyline, yycolumn); 
}

{BOOLEAN}   { 
    log("BOOLEAN", yytext());
    return new Token(Token.Type.BOOLEAN, yytext(), yyline, yycolumn); 
}

{IDENTIFIER} { 
    log("IDENTIFIER", yytext());
    return new Token(Token.Type.IDENTIFIER, yytext(), yyline, yycolumn); 
}

{NUMBER}    { 
    String category = yytext().contains(".") ? "NUMBER (FLOAT)" : "NUMBER (INTEGER)";
    log(category, yytext());
    return new Token(Token.Type.NUMBER, yytext(), yyline, yycolumn); 
}

{SCIENTIFIC_NUMBER} {
    log("NUMBER (SCIENTIFIC)", yytext());
    return new Token(Token.Type.NUMBER, yytext(), yyline, yycolumn);
}

","         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.COMMA, yytext(), yyline, yycolumn); 
}

"+"         { 
    log("ARITHMETIC", yytext());
    return new Token(Token.Type.PLUS, yytext(), yyline, yycolumn); 
}
"-"         { 
    log("ARITHMETIC", yytext());
    return new Token(Token.Type.MINUS, yytext(), yyline, yycolumn); 
}
"*"         { 
    log("ARITHMETIC", yytext());
    return new Token(Token.Type.MULTIPLY, yytext(), yyline, yycolumn); 
}
"/"         { 
    log("ARITHMETIC", yytext());
    return new Token(Token.Type.DIVIDE, yytext(), yyline, yycolumn); 
}
"%"         { 
    log("ARITHMETIC", yytext());
    return new Token(Token.Type.MODULO, yytext(), yyline, yycolumn); 
}

"=="        { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.EQUAL, yytext(), yyline, yycolumn); 
}
"!="        { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.NOT_EQUAL, yytext(), yyline, yycolumn); 
}
"<"         { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.LESS_THAN, yytext(), yyline, yycolumn); 
}
">"         { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.GREATER_THAN, yytext(), yyline, yycolumn); 
}
"<="        { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.LESS_OR_EQUAL, yytext(), yyline, yycolumn); 
}
">="        { 
    log("COMPARISON", yytext());
    return new Token(Token.Type.GREATER_OR_EQUAL, yytext(), yyline, yycolumn); 
}

"&&"        { 
    log("LOGICAL", yytext());
    return new Token(Token.Type.LOGICAL_AND, yytext(), yyline, yycolumn); 
}
"||"        { 
    log("LOGICAL", yytext());
    return new Token(Token.Type.LOGICAL_OR, yytext(), yyline, yycolumn); 
}
"!"         { 
    log("LOGICAL", yytext());
    return new Token(Token.Type.LOGICAL_NOT, yytext(), yyline, yycolumn); 
}

"&"         { 
    log("BITWISE", yytext());
    return new Token(Token.Type.BITWISE_AND, yytext(), yyline, yycolumn); 
}
"|"         { 
    log("BITWISE", yytext());
    return new Token(Token.Type.BITWISE_OR, yytext(), yyline, yycolumn); 
}
"^"         { 
    log("BITWISE", yytext());
    return new Token(Token.Type.BITWISE_XOR, yytext(), yyline, yycolumn); 
}
"~"         { 
    log("BITWISE", yytext());
    return new Token(Token.Type.BITWISE_NOT, yytext(), yyline, yycolumn); 
}
"<<"        { 
    log("BITWISE", yytext());
    return new Token(Token.Type.LEFT_SHIFT, yytext(), yyline, yycolumn); 
}
">>"        { 
    log("BITWISE", yytext());
    return new Token(Token.Type.RIGHT_SHIFT, yytext(), yyline, yycolumn); 
}

"("         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.LPAREN, yytext(), yyline, yycolumn); 
}
")"         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.RPAREN, yytext(), yyline, yycolumn); 
}
"{"         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.LBRACE, yytext(), yyline, yycolumn); 
}
"}"         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.RBRACE, yytext(), yyline, yycolumn); 
}
"["         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.LBRACKET, yytext(), yyline, yycolumn); 
}
"]"         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.RBRACKET, yytext(), yyline, yycolumn); 
}

"="         { 
    log("ASSIGNMENT", yytext());
    return new Token(Token.Type.ASSIGN, yytext(), yyline, yycolumn); 
}
"+="        { 
    log("ASSIGNMENT", yytext());
    return new Token(Token.Type.PLUS_ASSIGN, yytext(), yyline, yycolumn); 
}
"-="        { 
    log("ASSIGNMENT", yytext());
    return new Token(Token.Type.MINUS_ASSIGN, yytext(), yyline, yycolumn); 
}
"*="        { 
    log("ASSIGNMENT", yytext());
    return new Token(Token.Type.MULTIPLY_ASSIGN, yytext(), yyline, yycolumn); 
}
"/="        { 
    log("ASSIGNMENT", yytext());
    return new Token(Token.Type.DIVIDE_ASSIGN, yytext(), yyline, yycolumn); 
}

";"         { 
    log("DELIMITER", yytext());
    return new Token(Token.Type.SEMICOLON, yytext(), yyline, yycolumn); 
}

{WHITESPACE}    { /* 忽略空白 */ }
{SINGLE_COMMENT} { /* 忽略单行注释 */ }
{MULTI_COMMENT}  { /* 忽略多行注释 */ }

.           { 
    log("UNEXPECTED CHARACTER", yytext());
    return new Token(Token.Type.ERROR, yytext(), yyline, yycolumn); 
}

<<EOF>>     { return null; }
