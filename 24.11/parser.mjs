import * as LEX  from "./lex.mjs";
import  { lex, Token } from './lex.mjs';

/*******************Sentence声明开始，有三种*******************/
class Sentence {
    constructor(type) {
        this.endPos = -1;
        if (type) {
            this.type = type.toUpperCase() + "_SENTENCE";
        }
    }
}
class VarSentence extends Sentence {
    constructor(name, value, endPos) {
        super("VAR");
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
        this.endPos = endPos;
    }

    toString() {
        return `var ${this.name} = ${this.value.toString()}`;
    }
}

class ReturnSentence extends Sentence {
    constructor(value, endPos) {
        super("RETURN");
        this.value = value; // 这里的value也是表达式
        this.endPos = endPos;
    }

    toString() {
        return `return ${this.value.toString()}`;
    }
}

class BlockSentence extends Sentence {
    constructor(sentences, endPos) {
        super("BLOCK");
        this.sentences = sentences;
        this.endPos = endPos;
    }
    toString() {
        return `{
    ${this.sentences.map(it=>it.toString()).join('\n')}
}`
    }
}

class ExpressionStatement extends Sentence {
    constructor(expression, endPos) {
        super("EXPRESSION");
        this.expression = expression; // 这里的expression也是表达式
        this.endPos = endPos;
    }

    toString() {
        return this.expression.toString();
    }
}
/*******************Sentence声明结束*******************/

/*******************表达式Ast节点声明开始*******************/
class AstNode {
}

class NumberAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}

class IdentifierAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}

class NullAstNode extends AstNode {

    toString() {
        return "null";
    }
}

class StringAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}

class BooleanAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}

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

class PrefixOperatorAstNode extends AstNode {
    constructor(token, right) {
        super(false);
        this.op = token;
        this.right = right;
    }
    toString() {
        return `(${this.op.value} ${this.right.toString()})`;
    }
}

class PostfixOperatorAstNode extends AstNode {
    constructor(token, left) {
        super(false);
        this.op = token;
        this.left = left;
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value})`;
    }
}

class FunctionDeclarationAstNode extends AstNode {
    constructor(name, params, body) {
        super();
        this.name = name == null ? null :new IdentifierAstNode(name);
        this.params = params;
        this.body = body;
    }
    toString() {
        return `function${this.name ? ' ' + this.name.toString() : ''}(${this.params.join(',')})${this.body.map(it=>it.toString()).join('\n')}`;
    }
}

class FunctionCallAstNode extends AstNode {
    constructor(name, args) {
        super();
        this.name = new IdentifierAstNode(name);
        this.args = args; // args是ast数组
    }
    toString() {
        return `${this.name.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}

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

/*******************表达式Ast节点声明结束*******************/
// 辅助函数
function assert(condition, msg) {
    if (!condition) {
        throw new Error("assert failed "+ msg);
    }
}

// 语法解析函数，把tokens转换为sentences
function parse(tokens) {
    var sentences = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var sentence = null;
        if (token.type === LEX.SEMICOLON) {
            continue;
        } else if (token.type === LEX.EOF) {
            break;
        } if (token.type === LEX.VAR) {
            sentence = parseVarSentence(tokens, i);
        } else if (token.type === LEX.RETURN) {
            sentence = parseReturnSentence(tokens, i);
        } else if (token.type === LEX.LBRACE) {
            sentence = parseBlockSentence(tokens, i);
        } else {
            sentence = parseExpressionStatement(tokens, i);
        }
        i = sentence.endPos;
        sentences.push(sentence);
    }
    return sentences;
}

// 从start开始转换成var语句，校验是不是var xx = xxx;格式，然后需要解析表达式parseExpression函数。
function parseVarSentence(tokens, start) {
    assert (tokens[start].type === LEX.VAR);
    assert (tokens[start + 1].type === LEX.IDENTIFIER);
    assert (tokens[start + 2].type === LEX.ASSIGN);
    var name = new IdentifierAstNode(tokens[start + 1]);
    var braceCount = 0;
    for (var i = start + 3; i < tokens.length; i++) {
        if (tokens[i].type == LEX.LBRACE) braceCount++;
        if (tokens[i].type == LEX.RBRACE) braceCount--;
        if ((braceCount <= 0 &&tokens[i].type === LEX.SEMICOLON) || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 3, i);
            return new VarSentence(name, value, i);
        }
    }
}

// 与var语句类似
function parseReturnSentence(tokens, start) {
    assert (tokens[start].type === LEX.RETURN);
    var braceCount = 0;
    for (var i = start + 1; i < tokens.length; i++) {
        if (tokens[i].type == LEX.LBRACE) braceCount++;
        if (tokens[i].type == LEX.RBRACE) braceCount--;
        if ((braceCount <= 0 &&tokens[i].type === LEX.SEMICOLON) || tokens[i].type === LEX.EOF) {
            return new ReturnSentence(parseExpression(tokens, start + 1, i), i);
        }
    }
    return new ReturnSentence(parseExpression(tokens, start + 1, i), tokens.length - 1);
}

// 转换为块语句，块语句中包含一个语句数组
function parseBlockSentence(tokens, start) {
    var braceCount = 0;
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i].type == LEX.LBRACE) braceCount++;
        if (tokens[i].type == LEX.RBRACE) braceCount--;
        if (braceCount == 0) {
            return new BlockSentence(parse(tokens.slice(start + 1, i)), i);
        }
    }
    throw new Error("brace not close for block sentence")
}

// 转换为表达式语句
function parseExpressionStatement(tokens, start) {
    var braceCount = 0;
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i].type == LEX.LBRACE) braceCount++;
        if (tokens[i].type == LEX.RBRACE) braceCount--;
        if ((braceCount <= 0 && tokens[i].type === LEX.SEMICOLON) || tokens[i].type === LEX.EOF) {
            return new ExpressionStatement(parseExpression(tokens, start, i), i);
        }
    }
    return new ExpressionStatement(parseExpression(tokens, start, tokens.length - 1), tokens.length - 1);
}
 

// 二元运算符优先级表
const precedenceMap = {
    '=': 10,
    '||': 11, '&&': 12, '^': 13,
    '==': 14, '!=': 14,
    '<': 15, '<=': 15, '>': 15, '>=': 15,
    '<<': 16, '>>': 16, '>>>': 16,
    '+': 17, '-': 17,
    '*': 18, '/': 18, '%': 18,
}

// 最重要的表达式解析函数
function parseExpression(tokens, start, end) {
    var stack = [];
    var i = start, mid = null;
    while (i < end) {
        // 元素类型可能不是数字，这里封装成一个getNode方法，处理字面量和前缀运算符等等
        mid = mid == null ? getNode() : mid;
        // 其他代码基本没变，就是getNode过程中i向后移动了，所以下面i+1的地方改成了i，i+2的地方改成i++了
        var opNode = i == end ? null : new InfixOperatorAstNode(tokens[i]);
        var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
        if (opNode == null || opNode.precedence <= stackTopPrecedence) {
            if (stack.length == 0) return mid;
            var top = stack.pop();
            top.right = mid;
            mid = top;
            if (opNode == null && stack.length == 0) {
                return mid;
            }
        } else {
            opNode.left = mid;
            stack.push(opNode);
            i++;
            mid = null;
        }
    }
    function getNode(token) {
        var token = tokens[i];
        var node = null;
        switch (token.type) {
            case LEX.NUMBER:
                node = new NumberAstNode(token);
                i++; break;
            case LEX.STRING:
                node = new StringAstNode(token);
                i++; break;
            case LEX.BOOLEAN:
                node = new BooleanAstNode(token);
                i++; break;
            case LEX.NULL:
                node = new NullAstNode();
                i++; break;
            case LEX.IDENTIFIER:
                // 函数调用
                if (i + 1 < end && tokens[i + 1].type == LEX.LPAREN) {
                    node = parseFunctionCall();
                } else {
                    i++;
                    node = new IdentifierAstNode(token);
                }
                break;
            case LEX.LPAREN:
                node = parseGroup();
                break;
            case LEX.FUNCTION:
                node = parseFunctionDeclaration();
                break;
            // 遇到前缀运算符
            case LEX.PLUS:
            case LEX.MINUS:
            case LEX.INCREMENT:
            case LEX.DECREMENT:
            case LEX.NOT:
            case LEX.BIT_NOT:
                i++;
                node = new PrefixOperatorAstNode(token, getNode());
                break;
            default:
                throw new Error('unexpected token in getNode: ' + token.type);
        }
        // 后缀
        if (tokens[i].type == LEX.INCREMENT || tokens[i].type == LEX.DECREMENT) {
            node = new PostfixOperatorAstNode(tokens[i], node);
            i++;
        }
        return node;
    }
    function parseGroup() {
        assert(tokens[i].type == LEX.LPAREN);
        var parenCount = 1;
        for (var j = i + 1; j < end; j++) {
            if (tokens[j].type == LEX.LPAREN) parenCount++;
            if (tokens[j].type == LEX.RPAREN) parenCount--;
            if (parenCount == 0) {
                var exp = parseExpression(tokens, i + 1, j);
                i = j + 1; // j是右括号，所以还要再往后一个
                return new GroupAstNode(exp);
            }
        }
        throw new Error('group not close')
    }
    function parseFunctionCall() {
        assert(tokens[i].type == LEX.IDENTIFIER); // 函数名
        assert(tokens[i + 1].type == LEX.LPAREN); // 左括号
        var nameTk = tokens[i];
        i = i + 2; // 此时i位于第一个参数的start位置

        // 识别参数要找逗号来隔开每个参数的表达式，分别去递归解析
        var args = [];
        var innerPattern = 0, innerBracket = 0;
        for (var j = i; j < end; j++) {
            if (tokens[j].type == LEX.LPAREN) innerPattern++;
            if (tokens[j].type == LEX.RPAREN) innerPattern--;
            if (tokens[j].type == LEX.LBRACE) innerBracket++;
            if (tokens[j].type == LEX.RBRACE) innerBracket--;
            // 最后一个参数
            if (innerPattern == -1) {
                args.push(parseExpression(tokens, i, j));
                i = j + 1;
                return new FunctionCallAstNode(nameTk, args);
            }
            // 出现逗号，并且不在内部的()或者[]中，说明是参数的结束
            if (tokens[j].type == LEX.COMMA && innerPattern == 0) {
                args.push(parseExpression(tokens, i, j));
                i = j + 1;
            }
        }
        throw new Error("unexpected end of expression");
    }
    function parseFunctionDeclaration() {
        assert(tokens[i].type == LEX.FUNCTION);
        // 1 函数名识别，null为匿名函数
        var name = tokens[i + 1].type == LEX.IDENTIFIER ? tokens[i++] : null;
        assert(tokens[i + 1].type == LEX.LPAREN);
        // 2 参数识别，格式就是括号内，identifier，逗号，..循环..右括号结束
        var params = [];
        for (var j = i + 2; j < end; j+=2) {
            assert(tokens[j].type == LEX.IDENTIFIER);
            assert(tokens[j+1].type == LEX.COMMA || tokens[j + 1].type == LEX.RPAREN);
            params.push(new IdentifierAstNode(tokens[j]));
            // 右括号结束参数部分
            if (tokens[j + 1].type == LEX.RPAREN) {
                i = j + 2;
                break;
            }
        }
        // 3 body识别，按照大括号识别即可，注意有可能有大括号嵌套，所以要记录左大括号出现的数量，当右大括号出现，数量减一。数量为0，就是函数body结束
        assert(tokens[i].type == LEX.LBRACE);
        var braceCount = 1;
        for (var j = i + 1; j < end; j++) {
            if (tokens[j].type == LEX.LBRACE) braceCount++;
            if (tokens[j].type == LEX.RBRACE) braceCount--;
            // 函数结束
            if (braceCount == 0) {
                var body = parse(tokens.slice(i, j + 1));
                i = j + 1;
                return new FunctionDeclarationAstNode(name, params, body);
            }
        }
    }
}
var code = `var a = (-1 + -2) * a++ / null - !false + "hello" + add(add(3,add(1,2)), 4);
var add = function(a, b) {
    return a + b;
};
function minus(a,b) {
    return a- b;
};
{var a = 1;};
`
var tokens = lex(code);
var sentences = parse(tokens)
for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}