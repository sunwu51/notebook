const ASSIGN = 'ASSIGN', LPAREN = 'LPAREN', RPAREN = 'RPAREN', LBRACE = 'LBRACE', RBRACE = 'RBRACE', LBRACKET = 'LBRACKET', RBRACKET = 'RBRACKET',
    SEMICOLON = 'SEMICOLON', COMMA = 'COMMA', PLUS = 'PLUS', MINUS = 'MINUS', MULTIPLY = 'MULTIPLY', DIVIDE = 'DIVIDE', MODULUS = 'MODULUS', 
    POINT = 'POINT',
    AND = 'AND', OR = 'OR', NOT = 'NOT', GT = 'GT', LT = 'LT', GTE = 'GTE', LTE = 'LTE', NEQ = 'NEQ',
    BAND = 'BAND', BOR = 'BOR', BXOR = 'BXOR', BNOT = 'BNOT', BSHL = 'BSHL', BSHR = 'BSHR';

const VAR = 'VAR', IDENTIFIER = 'IDENTIFIER', NUMBER = 'NUMBER', STRING = 'STRING', FUNCTION = 'FUNCTION', IF = 'IF', ELSE = 'ELSE', RETURN = 'RETURN', CONTINUE = 'CONTINUE', BREAK = 'BREAK',FOR = "for", WHILE = "while", NEW_LINE='NEW_LINE', EOF = 'EOF';
const KEYWORDS = {
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

function lex(input) {
    let tokens = []
    let position = 0
    while (position < input.length) {
        switch (input[position]) {
            // 有特殊作用的单个字符
            case '=':
                if (input[position + 1] == '=') {
                    tokens.push({type: EQ, value: '=='}); position += 2; break;
                } else {
                    tokens.push({type: ASSIGN, value: '='}); position++; break;
                }
            case '(':
                tokens.push({type: LPAREN, value: '('}); position++; break;
            case ')':
                tokens.push({type: RPAREN, value: ')'}); position++; break;
            case '[':
                tokens.push({type: LBRACKET, value: '['}); position++; break;
            case ']':
                tokens.push({type: RBRACKET, value: ']'}); position++; break;
            case '{':
                tokens.push({type: LBRACE, value: '{'}); position++; break;
            case '}':
                tokens.push({type: RBRACE, value: '}'}); position++; break;
            case '+':
                tokens.push({type: PLUS, value: '+'}); position++; break;
            case '-':
                tokens.push({type: MINUS, value: '-'}); position++; break;
            case '*':
                tokens.push({type: MULTIPLY, value: '*'}); position++; break;
            case '/':
                tokens.push({type: DIVIDE, value: '/'}); position++; break;
            case '%':
                tokens.push({type: MODULUS, value: '%'}); position++; break;
            case '.':
                tokens.push({type: POINT, value: '.'}); position++; break;
            case '^':
                tokens.push({type: BXOR, value: '^'}); position++; break;
            case '~':
                tokens.push({type: BNOT, value: '~'}); position++; break;
            case '|':
                if (input[position + 1] == '|') {
                    tokens.push({type: OR, value: '||'}); position += 2; break;
                } else {
                    tokens.push({type: BOR, value: '|'}); position++; break;
                }
            case '&':
                if (input[position + 1] == '&') {
                    tokens.push({type: AND, value: '&&'}); position += 2; break;
                } else {
                    tokens.push({type: BAND, value: '&'}); position++; break;
                }
            case '!':
                if (input[position + 1] == '=') {
                    tokens.push({type: NEQ, value: '!='}); position += 2; break;
                } else {
                    tokens.push({type: NOT, value: '!'}); position++; break;
                }
            case '<':
                if (input[position + 1] == '=') {
                    tokens.push({type: LTE, value: '<='}); position += 2; break;
                } else if (input[position + 1] == '<') {
                    tokens.push({type: BSHL, value: '<<'}); position += 2; break;
                } else {
                    tokens.push({type: LT, value: '<'}); position++; break;
                }
            case '>':
                if (input[position + 1] == '=') {
                    tokens.push({type: GTE, value: '>='}); position += 2; break;
                } else if (input[position + 1] == '>') {
                    tokens.push({type: BSHR, value: '>>'}); position += 2; break;
                } else {
                    tokens.push({type: GT, value: '>'}); position++; break;
                }
            case ';':
                tokens.push({type: SEMICOLON, value: ';'}); position++; break;
            case ',':
                tokens.push({type: COMMA, value: ','}); position++; break;
            // 空格 tab 跳过即可，不需要解析
            case ' ':
            case '\t':
            case '\r':
                position++; break;
            // 回车这里解析一下，因为想要支持js的弱判断
            case '\n':
                 tokens.push({type: NEW_LINE, value: '\n'}); position++; break;
            case '\'':
                var start = position;
                while (true) {
                    position++;
                    // 字符中间不能有回车
                    if (position >= input.length) throw new Error('Unterminated string');
                    if (input[position] == '\n') throw new Error('Enter is not allowed in string');
                    if (input[position] == '\'' && input[position - 1] != '\\' ) {
                        tokens.push({type: STRING, value: input.substring(start, position + 1)});
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
                        tokens.push({type: STRING, value: input.substring(start, position + 1)});
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
                    tokens.push({type: NUMBER, value: input.substring(start, position)})
                    break;
                }
                // 字母类型
                //// 首字符必须为字母下划线，后面的可以是数字
                if (input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_') {
                    do {
                        position++
                    } while (input[position] >= '0' && input[position] <= '9' || input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_')
                    let value = input.substring(start, position)
                    if (KEYWORDS[value]) tokens.push({type: KEYWORDS[value], value})
                    else tokens.push({type: IDENTIFIER, value: input.substring(start, position)})
                    break;
                }
                // 不认识的字符抛出异常
                throw new Error('unexpected input');
        }
    }
    tokens.push({type: EOF, value: ''})
    return tokens
}

let input = `var x = 10;
var z = 'ff\\'f';
function add(x, y) {
    return x + y;
}`


console.log(lex(input))