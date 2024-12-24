/**=========================================> 这是parser_test2.mjs中相同的部分 <========================================= */
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
        return `var ${this.name} = ${this.value.toString()}`;
    }
}

class ReturnSentence extends Sentence {
    constructor(value) {
        super("RETURN");
        this.value = value; // 这里的value也是表达式
    }
    toString() {
        return `return ${this.value.toString()}`;
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
        return this.expression.toString();
    }
}
class AstNode {
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
// 语法解析，把tokens转换为sentences
function parse(tokens) {
    // 从i开始转换成var语句，校验是不是var xx = xxx;格式，然后需要解析表达式parseExpression函数。
    function parseVarSentence() {
        assert (tokens[i].type === LEX.VAR);
        assert (tokens[i + 1].type === LEX.IDENTIFIER);
        assert (tokens[i + 2].type === LEX.ASSIGN);
        var name = new IdentifierAstNode(tokens[i + 1]);
        for (var j = i + 3; j < tokens.length; j++) {
            if (tokens[j].type === LEX.SEMICOLON || tokens[j].type === LEX.EOF) {
                var value = parseExpression(tokens, i + 3);
                i = j;
                return new VarSentence(name, value);
            }
        }
    }
    // 与var语句类似
    function parseReturnSentence() {
        assert (tokens[i].type === LEX.RETURN);
        for (var j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === LEX.SEMICOLON || tokens[j].type === LEX.EOF) {
                var value = parseExpression(tokens, i + 1);
                i = j;
                return new ReturnSentence(value);
            }
        }
    }
    // 转换为表达式语句
    function parseExpressionStatement() {
        for (var j = i; j < tokens.length; j++) {
            if (tokens[j].type === LEX.SEMICOLON || tokens[j].type === LEX.EOF) {
                var expression = parseExpression(tokens, i);
                i = j;
                return new ExpressionStatement(expression);
            }
        }
    }
    // 转换为块语句，块语句中包含一个语句数组
    function parseBlockSentence() {
        var braceCount = 0;
        for (var j = i; j < tokens.length; j++) {
            if (tokens[j].type == LEX.LBRACE) braceCount++;
            if (tokens[j].type == LEX.RBRACE) braceCount--;
            if (braceCount == 0) {
                return new BlockSentence(parse(tokens.slice(i + 1, i = j)));
            }
        }
        throw new Error("brace not close for block sentence")
    }
    var sentences = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var sentence = null;
        if (token.type === LEX.SEMICOLON) {
            continue;
        } else if (token.type === LEX.EOF) {
            break;
        } if (token.type === LEX.VAR) {
            sentence = parseVarSentence();
        } else if (token.type === LEX.RETURN) {
            sentence = parseReturnSentence();
        } else if (token.type === LEX.LBRACE) {
            sentence = parseBlockSentence();
        } else {
            sentence = parseExpressionStatement();
        }
        sentences.push(sentence);
    }
    return sentences;
}
function assert(condition) {
    if (!condition) {
        throw new Error("assert failed");
    }
}
/**=========================================> 这是parser_test2.mjs中相同的部分 <========================================= */
const precedenceMap = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
}
class NumberAstNode extends AstNode {
    constructor(value) {
        super(true);
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super(false);
        this.op = token;
        this.left = null;
        this.right = null;
        this.precedence = precedenceMap[token.value];
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value} ${this.right.toString()})`;
    }
}

function parseExpression(tokens, start) {
    var stack = [];
    var i = start, mid = null;
    while (true) {
        // 每个循环，准备好栈顶优先级、中间元素、当前操作符
        var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
        mid = mid == null ? new NumberAstNode(tokens[i++].value) : mid;
        var opNode = getEofOrInfixNode(tokens, i);
        // 结束循环的条件
        if (opNode.precedence == 0 && stackTopPrecedence == 0)return mid;
        // 栈顶操作符赢得mid：弹出栈顶，填充right，并作为新的mid; NULL是EOF是最低优先级
        if (opNode.precedence <= stackTopPrecedence) {
            var top = stack.pop();
            top.right = mid;
            mid = top;
        }
        // 当前操作符赢得mid：塞入栈中，继续向后走
        else {
            opNode.left = mid;
            stack.push(opNode);
            i++;
            mid = null; // 往后走取新的mid
        }
    }
}
function getEofOrInfixNode(tokens, index) {
    var eof = new InfixOperatorAstNode('EOF');
    eof.precedence = 0;
    if (index >= tokens.length) return eof
    var token = tokens[index];
    if (precedenceMap[token.value] == null) {
        return eof;
    }
    return new InfixOperatorAstNode(tokens[index]);
}
var code = `var a = 1 + 2 * 3 / 4 - 5;`;

var tokens = lex(code);
var sentences = parse(tokens)

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}