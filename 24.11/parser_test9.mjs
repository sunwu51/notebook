import * as LEX  from "./lex.mjs";
import  { lex } from './lex.mjs';

class Sentence {
    constructor(type) {
        if (type) {
            this.type = type.toUpperCase() + "_SENTENCE";
        }
    }
}
class VarSentence extends Sentence {
    constructor(name, value) {
        super("VAR");
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
    }

    toString() {
        return `var ${this.name} = ${this.value.toString()};`;
    }
}

class ReturnSentence extends Sentence {
    constructor(value) {
        super("RETURN");
        this.value = value; // 这里的value也是表达式
    }
    toString() {
        return `return ${this.value.toString()};`;
    }
}

class BlockSentence extends Sentence {
    constructor(sentences) {
        super("BLOCK");
        this.sentences = sentences;
    }
    toString() {
        return `{
    ${this.sentences.map(it=>it.toString()).join('\n')}
}`
    }
}

class ExpressionStatement extends Sentence {
    constructor(expression) {
        super("EXPRESSION");
        this.expression = expression; // 这里的expression也是表达式
    }

    toString() {
        return this.expression.toString() + ";";
    }
}
// 基础类型
class AstNode {
}
// 数字字面量
class NumberAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}
// 变量名/函数名字面量
class IdentifierAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}
// null字面量
class NullAstNode extends AstNode {
    toString() {
        return "null";
    }
}

// 字符串字面量
class StringAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
    toString() {
        return this.token.value;
    }
}
// boolean字面量
class BooleanAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
    toString() {
        return this.token.value;
    }
}
// 中缀操作符节点
class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super();
        this.op = token;
        this.left = null;
        this.right = null;
        this.precedence = precedenceMap[token.value];
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value} ${this.right.toString()})`;
    }
}
// 前缀操作符
class PrefixOperatorAstNode extends AstNode {
    constructor(token, right) {
        super(false);
        this.op = token;
        this.right = right;
        this.precedence = prefixPrecedenceMap[token.value];
    }
    toString() {
        return `(${this.op.value} ${this.right.toString()})`;
    }
}
// 后缀操作符
class PostfixOperatorAstNode extends AstNode {
    constructor(token, left) {
        super(false);
        this.op = token;
        this.left = left;
        this.precedence = postfixPrecedenceMap[token.value];
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value})`;
    }
}
// 函数声明
class FunctionDeclarationAstNode extends AstNode {
    constructor(params, body) {
        super();
        this.params = params;
        this.body = body;
    }
    toString() {
        return `function(${this.params.join(',')})${this.body.toString()}`;
    }
}
// 函数调用
class FunctionCallAstNode extends AstNode {
    constructor(caller, args) {
        super();
        this.caller = caller;
        this.args = args;
    }
    toString() {
        return `${this.caller.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}
// 分组节点
class GroupAstNode extends AstNode {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString() {
        // 因为小括号已经在运算符的toString中使用了，这里为了更好的凸显使用中文中括号
        return `【${this.exp.toString()}】`
    }
}










const precedenceMap = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
}
const prefixPrecedenceMap = {
    '-': 100,
    '!': 100,
    '~': 100,
    '+': 100,
    '++': 100,
    '--': 100
}
const postfixPrecedenceMap = {
    '++': 200,
    '--': 200
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    // 语法解析，把tokens转换为sentences
    parse() {
        var tokens = this.tokens;
        var sentences = [];
        for (;;) {
            var token = tokens[this.cursor];
            var sentence = null;
            if (token.type === LEX.SEMICOLON) {
                this.cursor++;
                continue;
            } else if (token.type === LEX.EOF) {
                break;
            } if (token.type === LEX.VAR) {
                sentence = this.parseVarSentence();
            } else if (token.type === LEX.RETURN) {
                sentence = this.parseReturnSentence();
            } else if (token.type === LEX.LBRACE) {
                sentence = this.parseBlockSentence();
            } else {
                sentence = this.parseExpressionStatement();
            }
            sentences.push(sentence);
        }
        return sentences;
    }
    parseVarSentence() {
        var tokens = this.tokens;
        assert (tokens[this.cursor++].type === LEX.VAR);
        assert (tokens[this.cursor].type === LEX.IDENTIFIER);
        var name = new IdentifierAstNode(tokens[this.cursor++]);
        assert (tokens[this.cursor++].type === LEX.ASSIGN);
        var value = this.parseExpression();
        return new VarSentence(name, value);
    }

    // 与var语句类似
    parseReturnSentence() {
        var tokens = this.tokens;
        assert (tokens[this.cursor++].type === LEX.RETURN);
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        return new ReturnSentence(value);
    }

    // 转换为表达式语句
    parseExpressionStatement() {
        var tokens = this.tokens;
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        return new ExpressionStatement(value);
    }
    // 转换为块语句，块语句中包含一个语句数组
    parseBlockSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.LBRACE, "brace not open for block sentence")
        var result = new BlockSentence(this.parse());
        assert(tokens[this.cursor++].type === LEX.RBRACE, "brace not close for block sentence");
        return result
    }

    parseExpression() {
        var tokens = this.tokens;
        var stack = [];
        var mid = null;
        while (true) {
            var stackTopPrecedence = stack.length == 0 ? 0: stack[stack.length - 1].precedence;
            mid = mid == null ? this.nextUnaryNode() : mid;
            // 如果是next返回的不完整前缀表达式，相当于left填充过的二元操作符，直接塞到stack
            if (mid instanceof PrefixOperatorAstNode && mid.right == null) {
                stack.push(mid);
                mid = null;
                continue;
            }
            var opNode = this.getEofOrInfixNodeOrPostNode(tokens, this.cursor);
            if (opNode.precedence == 0 && stackTopPrecedence == 0) 
                return mid;
            if (opNode instanceof PostfixOperatorAstNode) {
                opNode.left = mid;
                mid = opNode;
                this.cursor++;
            }
            else if (opNode.precedence <= stackTopPrecedence) {
                var top = stack.pop();
                top.right = mid;
                mid = top;
            }
            else {
                opNode.left = mid;
                stack.push(opNode);
                this.cursor++;
                mid = null;
            }
        }
    }

    nextUnaryNode() {
        var tokens = this.tokens;
        var node = null;
        switch (tokens[this.cursor].type) {
            case LEX.NUMBER:
                node = new NumberAstNode(tokens[this.cursor++]);
                break;
            case LEX.STRING:
                node = new StringAstNode(tokens[this.cursor++]);
                break;
            case LEX.BOOLEAN:
                node = new BooleanAstNode(tokens[this.cursor++]);
                break;
            case LEX.NULL:
                node = new NullAstNode(tokens[this.cursor++]);
                break;
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[this.cursor++]);
                break;
            // 遇到前缀运算符
            case LEX.PLUS:
            case LEX.MINUS:
            case LEX.NOT:
            case LEX.BIT_NOT:
            case LEX.INCREMENT:
            case LEX.DECREMENT:    // 使用parseExpression函数递归，但是要传递当前符号的优先级
                node = new PrefixOperatorAstNode(tokens[this.cursor++], null);
                break;
            // 分组
            case LEX.LPAREN:
                // 递归解析(后面的即可，因为遇到)的时候，parseExpression无法识别，就会结束解析
                this.cursor++;
                // GroupAstNode其实可有可无
                node = new GroupAstNode(this.parseExpression());
                assert(tokens[this.cursor++].type == LEX.RPAREN, "group not closed");
                break;
            default:
                throw new Error('unexpected token in nextUnary: ' + tokens[this.cursor].type);
        }
        
        return node;
    }
    getEofOrInfixNodeOrPostNode(tokens, index) {
        var eof = new InfixOperatorAstNode('EOF');
        eof.precedence = 0;
        if (index >= tokens.length) return eof
        var token = tokens[index];
        if (precedenceMap[token.value] == null && postfixPrecedenceMap[token.value] == null) {
            return eof;
        }
        if (token.type == LEX.INCREMENT || token.type == LEX.DECREMENT) {
            return new PostfixOperatorAstNode(tokens[index], null);
        }
        return new InfixOperatorAstNode(tokens[index]);
    }
}

function assert(condition) {
    if (!condition) {
        throw new Error("assert failed");
    }
}


var code = `var a = -1 * (-++ x- y--) * 4;`;

var code = `var a = -1 + -2 * a++ / null - !false + "hello";`

var tokens = lex(code);
var sentences = new Parser(tokens).parse()

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}