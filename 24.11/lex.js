// 赋值 左括号 右括号 左大括号 右大括号 加号 分号 逗号
const ASSIGN = 'ASSIGN', LPAREN = 'LPAREN', RPAREN = 'RPAREN', LBRACE = 'LBRACE', RBRACE = 'RBRACE', PLUS = 'PLUS', SEMICOLON = 'SEMICOLON', COMMA = 'COMMA';
// var 标识符 数字 函数 
const VAR = 'VAR', IDENTIFIER = 'IDENTIFIER', NUMBER = 'NUMBER', FUNCTION = 'FUNCTION';
function lex(input) {
    let tokens = []
    let position = 0
    while (position < input.length) {
        switch (input[position]) {
            // 有特殊作用的单个字符
            case '=':
                tokens.push({type: ASSIGN, value: '='}); position++; break;
            case '(':
                tokens.push({type: LPAREN, value: '('}); position++; break;
            case ')':
                tokens.push({type: RPAREN, value: ')'}); position++; break;
            case '{':
                tokens.push({type: LBRACE, value: '{'}); position++; break;
            case '}':
                tokens.push({type: RBRACE, value: '}'}); position++; break;
            case '+':
                tokens.push({type: PLUS, value: '+'}); position++; break;
            case ';':
                tokens.push({type: SEMICOLON, value: ';'}); position++; break;
            case ',':
                tokens.push({type: COMMA, value: ','}); position++; break;
            // 空格 tab 换行跳过即可，不需要解析
            case ' ':
            case '\t':
            case '\r':
            case '\n':
                position++; break;
            // 剩下数字或字母
            default:
                let start = position
                // 数字类型
                while (input[position] >= '0' && input[position] <= '9') {
                    position++
                }
                if (start != position) {
                    tokens.push({type: NUMBER, value: input.substring(start, position)})
                    continue;
                }
                // 字母类型
                //// 首字符必须为字母下划线，后面的可以是数字
                if (input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_') {
                    do {
                        position++
                    } while (input[position] >= '0' && input[position] <= '9' || input[position] >= 'a' && input[position] <= 'z' || input[position] >= 'A' && input[position] <= 'Z' || input[position] == '_')
                    tokens.push({type: IDENTIFIER, value: input.substring(start, position)})
                    continue;
                }
                // 不认识的字符抛出异常
                throw new Error('unexpected input');
        }
    }
    return tokens
}

let input = `var x = 10;
function add(x, y) {
    return x + y;
}`


console.log(lex(input))