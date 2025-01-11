export const ASSIGN = 'ASSIGN', LPAREN = 'LPAREN', RPAREN = 'RPAREN', LBRACE = 'LBRACE', RBRACE = 'RBRACE', LBRACKET = 'LBRACKET', RBRACKET = 'RBRACKET',
    SEMICOLON = 'SEMICOLON', COMMA = 'COMMA', COLON = "COLON", PLUS = 'PLUS', MINUS = 'MINUS', MULTIPLY = 'MULTIPLY', DIVIDE = 'DIVIDE', MODULUS = 'MODULUS', 
    POINT = 'POINT', INCREMENT = 'INCREMENT', DECREMENT = 'DECREMENT',
    AND = 'AND', OR = 'OR', NOT = 'NOT', GT = 'GT', LT = 'LT', GTE = 'GTE', LTE = 'LTE', NEQ = 'NEQ', EQ="EQ",
    BAND = 'BAND', BOR = 'BOR', BNOT = 'BNOT', BSHL = 'BSHL', BSHR = 'BSHR';

export const VAR = 'VAR', IDENTIFIER = 'IDENTIFIER', NULL = "NULL", COMMENT = "COMMENT", TRUE = "TRUE", FALSE = "FALSE", NUMBER = 'NUMBER', STRING = 'STRING', FUNCTION = 'FUNCTION', IF = 'IF', ELSE = 'ELSE', THROW="THROW", RETURN = 'RETURN', CONTINUE = 'CONTINUE',
     BREAK = 'BREAK',FOR = "FOR", WHILE = "WHILE", NEW_LINE='NEW_LINE', EOF = 'EOF', NEW = "NEW", CLASS = "CLASS", EXTENDS = "EXTENDS", TRY="TRY", CATCH = "CATCH";
export const KEYWORDS = new Map(Object.entries({
    var: VAR,
    function: FUNCTION,
    if: IF,
    else: ELSE,
    return: RETURN,
    continue: CONTINUE,
    break: BREAK,
    for: FOR,
    while: WHILE,
    new: NEW,
    "throw": THROW,
    "class" : CLASS,
    "extends": EXTENDS,
    "true": TRUE,
    "false": FALSE,
    "null":NULL,
    "try": TRY,
    "catch": CATCH,
}));

export class LexError extends Error {
    constructor(msg, input, position) {
        super(msg);
        this.input = input;
        this.position = position;
    }
    toString() {
        return `[LEX] error ${this.message}, error near '${this.input.substring(this.position - 5, this.position + 5)}'`
    }
}

export class Token {
    constructor(type, value, line, pos) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.pos = pos;
    }
}

export function lex(input) {
    let tokens = []
    let position = 0;
    let line = 1, curLineStart = position;
    while (position < input.length) {
        switch (input[position]) {
            // 有特殊作用的单个字符
            case '=':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(EQ, '==', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(ASSIGN, '=', line, position - curLineStart + 1)); position++; break;
                }
            case '(':
                tokens.push(new Token(LPAREN, '(', line, position - curLineStart + 1)); position++; break;
            case ')':
                tokens.push(new Token(RPAREN, ')', line, position - curLineStart + 1)); position++; break;
            case '[':
                tokens.push(new Token(LBRACKET, '[', line, position - curLineStart + 1)); position++; break;
            case ']':
                tokens.push(new Token(RBRACKET, ']', line, position - curLineStart + 1)); position++; break;
            case '{':
                tokens.push(new Token(LBRACE, '{', line, position - curLineStart + 1)); position++; break;
            case '}':
                tokens.push(new Token(RBRACE, '}', line, position - curLineStart + 1)); position++; break;
            case '+':
                if (input[position + 1] == '+') {
                    tokens.push(new Token(INCREMENT, '++', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(PLUS, '+', line, position - curLineStart + 1)); position ++; break;
                }
            case '-':
                if (input[position + 1] == '-') {
                    tokens.push(new Token(DECREMENT, '--', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(MINUS, '-', line, position - curLineStart + 1)); position ++; break;
                }
            case '*':
                tokens.push(new Token(MULTIPLY, '*', line, position - curLineStart + 1)); position++; break;
            case '#':
                while (input[++position] != '\n' && position < input.length) {}
                tokens.push(new Token(COMMENT, input.substring(start, ++position), line, position - curLineStart + 1)); break;
            case '/':
                if (input[position + 1] == '/') {
                    var start = position;
                    while (input[2 + position++] != '\n' && position + 1 < input.length) {}
                    tokens.push(new Token(COMMENT, input.substring(start, ++position), line, position - curLineStart + 1)); break;
                } else {
                    tokens.push(new Token(DIVIDE, '/', line, position - curLineStart + 1)); position++; break;
                }
            case '%':
                tokens.push(new Token(MODULUS, '%', line, position - curLineStart + 1)); position++; break;
            case '.':
                tokens.push(new Token(POINT, '.', line, position - curLineStart + 1)); position++; break;
            case '~':
                tokens.push(new Token(BNOT, '~', line, position - curLineStart + 1)); position++; break;
            case '|':
                if (input[position + 1] == '|') {
                    tokens.push(new Token(OR, '||', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(BOR, '|', line, position - curLineStart + 1)); position++; break;
                }
            case '&':
                if (input[position + 1] == '&') {
                    tokens.push(new Token(AND, '&&', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(BAND, '&', line, position - curLineStart + 1)); position++; break;
                }
            case '!':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(NEQ, '!=', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(NOT, '!', line, position - curLineStart + 1)); position++; break;
                }
            case '<':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(LTE, '<=', line, position - curLineStart + 1)); position += 2; break;
                } else if (input[position + 1] == '<') {
                    tokens.push(new Token(BSHL, '<<', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(LT, '<', line, position - curLineStart + 1)); position++; break;
                }
            case '>':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(GTE, '>=', line, position - curLineStart + 1)); position += 2; break;
                } else if (input[position + 1] == '>') {
                    tokens.push(new Token(BSHR, '>>', line, position - curLineStart + 1)); position += 2; break;
                } else {
                    tokens.push(new Token(GT, '>', line, position - curLineStart + 1)); position++; break;
                }
            case ';':
                tokens.push(new Token(SEMICOLON, ';', line, position - curLineStart + 1)); position++; break;
            case ':':
                 tokens.push(new Token(COLON, ':', line, position - curLineStart + 1)); position++; break;
            case ',':
                tokens.push(new Token(COMMA, ',', line, position - curLineStart + 1)); position++; break;
            // 空格 tab 跳过即可，不需要解析
            case ' ':
            case '\t':
            case '\r':
                position++; break;
            // 回车忽略
            case '\n':
                position++; line++; curLineStart = position; break;
            case '\'':
                var start = position;
                while (true) {
                    position++;
                    // 字符中间不能有回车
                    if (position >= input.length) throw new LexError('Unterminated string at line: ' + line + ":" + (position - curLineStart + 1), input, position);
                    if (input[position] == '\n') throw new LexError('Enter is not allowed in string at line: ' + line + ":" + (position - curLineStart + 1), input, position);
                    if (input[position] == '\'' && input[position - 1] != '\\' ) {
                        tokens.push(new Token(STRING, JSON.parse(`${input.substring(start, position + 1)}`), line, position - curLineStart + 1));
                        position++;
                        break;
                    }
                }
                break;
            case '"':
                var start = position;
                while (true) {
                    position++;
                    // 字符中间不能有回车
                    if (position >= input.length) throw new LexError('Unterminated string at line: ' + line + ":" + (position - curLineStart + 1), input, position);
                    if (input[position] == '\n') throw new LexError('Enter is not allowed in string at line: ' + line + ":" + (position - curLineStart + 1), input, position);
                    if (input[position] == '"' && input[position - 1] != '\\' ) {
                        tokens.push(new Token(STRING, JSON.parse(`${input.substring(start, position + 1)}`), line, position - curLineStart + 1));
                        position++;
                        break;
                    }
                }
                break;
            // 剩下数字或字母
            default:
                var start = position
                // 数字类型 包括小数
                while ((input[position] >= '0' && input[position] <= '9') || input[position] == '.') {
                    position++
                }
                if (start != position) {
                    tokens.push(new Token(NUMBER, input.substring(start, position), line, position - curLineStart + 1))
                    break;
                }
                // 字母类型
                //// 首字符必须为字母下划线，后面的可以是数字
                if (input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_') {
                    do {
                        position++
                    } while (input[position] >= '0' && input[position] <= '9' || input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_')
                    let value = input.substring(start, position)
                    if (KEYWORDS.has(value)) tokens.push(new Token(KEYWORDS.get(value), value, line, position - curLineStart + 1))
                    else tokens.push(new Token(IDENTIFIER, value, line, position - curLineStart + 1))
                    break;
                }
                // 不认识的字符抛出异常
                throw new LexError('unexpected input at line: ' + line + ":" + (position - curLineStart + 1), input, position);
        }
    }
    tokens.push(new Token(EOF, '', line, position - curLineStart + 1))
    return tokens
}