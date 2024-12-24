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
///////////////////// 注意 AstNode新增了full属性
class AstNode {
    constructor(full) {
        if (full === undefined) this.full = false;
        this.full = full;
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
                var value = parseExpression(tokens, i + 3, j);
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
                var value = parseExpression(tokens, i + 1, j);
                i = j;
                return new ReturnSentence(value);
            }
        }
    }
    // 转换为表达式语句
    function parseExpressionStatement() {
        for (var j = i; j < tokens.length; j++) {
            if (tokens[j].type === LEX.SEMICOLON || tokens[j].type === LEX.EOF) {
                var expression = parseExpression(tokens, i, j);
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
function parseExpression2(tokens, start, end) {
    // 1 先把tokens 转成 AstNode数组
    var nodes = [];
    for (var i = start; i < end; i++) {
        var token = tokens[i];
        if (token.type === LEX.NUMBER) {
            nodes.push(new NumberAstNode(token.value));
        } else if (token.type === LEX.PLUS || token.type === LEX.MINUS || token.type === LEX.MULTIPLY || token.type === LEX.DIVIDE) {
            var node = new InfixOperatorAstNode(token);
            nodes.push(node);
        } else {
            throw new Error("unexpected token type: " + token.type);
        }
    }
    // 2 数组元素不为1，则不停地遍历数组，找到最高优先级的，把两边的节点合并进来
    while (nodes.length > 1) {
        var maxPrecedence = -1, maxIndex = -1;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.full && node.precedence > maxPrecedence) {
                maxPrecedence = node.precedence;
                maxIndex = i;
            }
        }
        var maxPrecedenceNode = nodes[maxIndex];
        maxPrecedenceNode.left = nodes[maxIndex - 1];
        maxPrecedenceNode.right = nodes[maxIndex + 1];
        maxPrecedenceNode.full = true;
        // splice函数，把maxInde-1开始往后3个元素，替换为maxPrecedenceNode这一个元素
        nodes.splice(maxIndex - 1, 3, maxPrecedenceNode);
    }
    return nodes[0];
}

function parseExpression(tokens, start, end) {
    var nodes = [];
    var opNodes = [];
    for (var i = start; i < end; i++) {
        var token = tokens[i];
        if (token.type === LEX.NUMBER) {
            nodes.push(new NumberAstNode(token.value));
        } else if (token.type === LEX.PLUS || token.type === LEX.MINUS || token.type === LEX.MULTIPLY || token.type === LEX.DIVIDE) {
            var node = new InfixOperatorAstNode(token);
            while (opNodes.length > 0 && node.precedence <= opNodes[opNodes.length - 1].precedence) {
                var opNode = opNodes.pop();
                // opNode一定是倒数第二个元素，所以就可以简化成下面这样
                opNode.right = nodes.pop(); 
                nodes.pop(); 
                opNode.left = nodes.pop();
                nodes.push(opNode);
            }
            nodes.push(node);
            opNodes.push(node);
        } else {
            throw new Error("unexpected token type: " + token.type);
        }
    }
    while (opNodes.length > 0) {
        var opNode = opNodes.pop();
        // opNode一定是倒数第二个元素，所以就可以简化成下面这样
        opNode.right = nodes.pop(); 
        nodes.pop(); 
        opNode.left = nodes.pop();
        nodes.push(opNode);
    }
    return nodes[0];
}
var code = `var a = 1 + 2 * 3 / 4 - 5;`;

var tokens = lex(code);
var sentences = parse(tokens)

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}