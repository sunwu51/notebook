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
                assert(i = j, "parse var sentence failed");
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
                assert(i = j, "parse var sentence failed");
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
                assert(i = j, "parse var sentence failed");
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

// 参数中添加了优先级
function parseExpression(tokens, start, precedence=0) {
    // 因为用到递归，并且因为有递归，所以start这个下标的位置需要用引用类型
    // 这样递归更深中的移动，也会在上层改变start的值，所以进入前简单处理下start如果是数字，修改为对象类型
    if (start.index === undefined) {
        return parseExpression(tokens, {index:start}, precedence);
    }

    var leftNode = new NumberAstNode(tokens[start.index].value);
    while (start.index < tokens.length - 1 && isValidInfixOperator(tokens[start.index + 1])) {
        var opNode = new InfixOperatorAstNode(tokens[start.index + 1]);
        if (opNode.precedence <= precedence) {
            return leftNode;
        } else {
            opNode.left = leftNode;
            start.index += 2;
            opNode.right = parseExpression(tokens, start, opNode.precedence);
            leftNode = opNode;
        }
    }
    return leftNode;
}

function isValidInfixOperator(token) {
    return token.type === LEX.PLUS || token.type === LEX.MINUS || token.type === LEX.MULTIPLY || token.type === LEX.DIVIDE;
}

var code = `var a = 1 + 2 * 3 / 4 - 5;`;

var tokens = lex(code);
var sentences = parse(tokens)

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}