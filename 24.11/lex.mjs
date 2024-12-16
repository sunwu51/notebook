export const ASSIGN = 'ASSIGN', LPAREN = 'LPAREN', RPAREN = 'RPAREN', LBRACE = 'LBRACE', RBRACE = 'RBRACE', LBRACKET = 'LBRACKET', RBRACKET = 'RBRACKET',
    SEMICOLON = 'SEMICOLON', COMMA = 'COMMA', PLUS = 'PLUS', MINUS = 'MINUS', MULTIPLY = 'MULTIPLY', DIVIDE = 'DIVIDE', MODULUS = 'MODULUS', 
    POINT = 'POINT',
    AND = 'AND', OR = 'OR', NOT = 'NOT', GT = 'GT', LT = 'LT', GTE = 'GTE', LTE = 'LTE', NEQ = 'NEQ',
    BAND = 'BAND', BOR = 'BOR', BXOR = 'BXOR', BNOT = 'BNOT', BSHL = 'BSHL', BSHR = 'BSHR';

export const VAR = 'VAR', IDENTIFIER = 'IDENTIFIER', NUMBER = 'NUMBER', STRING = 'STRING', FUNCTION = 'FUNCTION', IF = 'IF', ELSE = 'ELSE', RETURN = 'RETURN', CONTINUE = 'CONTINUE', BREAK = 'BREAK',FOR = "for", WHILE = "while", NEW_LINE='NEW_LINE', EOF = 'EOF';
export const KEYWORDS = {
    var: VAR,
    function: FUNCTION,
    if: IF,
    else: ELSE,
    return: RETURN,
    continue: CONTINUE,
    break: BREAK,
    for: FOR,
    while: WHILE,
}

export class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

export function lex(input) {
    let tokens = []
    let position = 0
    while (position < input.length) {
        switch (input[position]) {
            // 有特殊作用的单个字符
            case '=':
                if (input[position + 1] == '=') {
                    tokens.push(new Token('EQ', '==')); position += 2; break;
                } else {
                    tokens.push(new Token(ASSIGN, '=')); position++; break;
                }
            case '(':
                tokens.push(new Token(LPAREN, '(')); position++; break;
            case ')':
                tokens.push(new Token(RPAREN, ')')); position++; break;
            case '[':
                tokens.push(new Token(LBRACKET, '[')); position++; break;
            case ']':
                tokens.push(new Token(RBRACKET, ']')); position++; break;
            case '{':
                tokens.push(new Token(LBRACE, '{')); position++; break;
            case '}':
                tokens.push(new Token(RBRACE, '}')); position++; break;
            case '+':
                tokens.push(new Token(PLUS, '+')); position++; break;
            case '-':
                tokens.push(new Token(MINUS, '-')); position++; break;
            case '*':
                tokens.push(new Token(MULTIPLY, '*')); position++; break;
            case '/':
                tokens.push(new Token(DIVIDE, '/')); position++; break;
            case '%':
                tokens.push(new Token(MODULUS, '%')); position++; break;
            case '.':
                tokens.push(new Token(POINT, '.')); position++; break;
            case '^':
                tokens.push(new Token(BXOR, '^')); position++; break;
            case '~':
                tokens.push(new Token(BNOT, '~')); position++; break;
            case '|':
                if (input[position + 1] == '|') {
                    tokens.push(new Token(OR, '||')); position += 2; break;
                } else {
                    tokens.push(new Token(BOR, '|')); position++; break;
                }
            case '&':
                if (input[position + 1] == '&') {
                    tokens.push(new Token(AND, '&&')); position += 2; break;
                } else {
                    tokens.push(new Token(BAND, '&')); position++; break;
                }
            case '!':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(NEQ, '!=')); position += 2; break;
                } else {
                    tokens.push(new Token(NOT, '!')); position++; break;
                }
            case '<':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(LTE, '<=')); position += 2; break;
                } else if (input[position + 1] == '<') {
                    tokens.push(new Token(BSHL, '<<')); position += 2; break;
                } else {
                    tokens.push(new Token(LT, '<')); position++; break;
                }
            case '>':
                if (input[position + 1] == '=') {
                    tokens.push(new Token(GTE, '>=')); position += 2; break;
                } else if (input[position + 1] == '>') {
                    tokens.push(new Token(BSHR, '>>')); position += 2; break;
                } else {
                    tokens.push(new Token(GT, '>')); position++; break;
                }
            case ';':
                tokens.push(new Token(SEMICOLON, ';')); position++; break;
            case ',':
                tokens.push(new Token(COMMA, ',')); position++; break;
            // 空格 tab 跳过即可，不需要解析
            case ' ':
            case '\t':
            case '\r':
                position++; break;
            // 回车这里解析一下，因为想要支持js的弱判断
            case '\n':
                 tokens.push(new Token(NEW_LINE, '\n')); position++; break;
            case '\'':
                var start = position;
                while (true) {
                    position++;
                    // 字符中间不能有回车
                    if (position >= input.length) throw new Error('Unterminated string');
                    if (input[position] == '\n') throw new Error('Enter is not allowed in string');
                    if (input[position] == '\'' && input[position - 1] != '\\' ) {
                        tokens.push(new Token(STRING, input.substring(start, position + 1)));
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
                    if (position >= input.length) throw new Error('Unterminated string');
                    if (input[position] == '\n') throw new Error('Enter is not allowed in string');
                    if (input[position] == '"' && input[position - 1] != '\\' ) {
                        tokens.push(new Token(STRING, input.substring(start, position + 1)));
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
                    tokens.push(new Token(NUMBER, input.substring(start, position)))
                    break;
                }
                // 字母类型
                //// 首字符必须为字母下划线，后面的可以是数字
                if (input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_') {
                    do {
                        position++
                    } while (input[position] >= '0' && input[position] <= '9' || input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_')
                    let value = input.substring(start, position)
                    if (KEYWORDS[value]) tokens.push(new Token(KEYWORDS[value], value))
                    else tokens.push(new Token(IDENTIFIER, value))
                    break;
                }
                // 不认识的字符抛出异常
                throw new Error('unexpected input');
        }
    }
    tokens.push(new Token(EOF, ''))
    return tokens
}
