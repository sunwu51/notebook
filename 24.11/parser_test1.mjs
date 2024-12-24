import * as LEX  from "./lex.mjs";
import  { lex } from './lex.mjs';

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
}

class ReturnSentence extends Sentence {
    constructor(value, endPos) {
        super("RETURN");
        this.value = value; // 这里的value也是表达式
        this.endPos = endPos;
    }
}

class BlockSentence extends Sentence {
    constructor(sentences, endPos) {
        super("BLOCK");
        this.sentences = sentences;
        this.endPos = endPos;
    }
}

class ExpressionStatement extends Sentence {
    constructor(expression, endPos) {
        super("EXPRESSION");
        this.expression = expression; // 这里的expression也是表达式
        this.endPos = endPos;
    }
}

class AstNode {}

class IdentifierAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
}
// 语法解析，把tokens转换为sentences
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
    for (var i = start + 3; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 3, i);
            return new VarSentence(name, value, i);
        }
    }
}

// 与var语句类似
function parseReturnSentence(tokens, start) {
    assert (tokens[start].type === LEX.RETURN);
    for (var i = start + 1; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 1, i);
            return new ReturnSentence(value, i);
        }
    }
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
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var expression = parseExpression(tokens, start, i);
            return new ExpressionStatement(expression, i);
        }
    }
}

// 这里先放置个空的逻辑，后面再补上
function parseExpression(tokens, start, end) {
    return new AstNode();
}

function assert(condition) {
    if (!condition) {
        throw new Error("assert failed");
    }
}

var code = `var a = 1 + 2 * 3 / 4 - 5;
            return a;
            func(a, b);
`;

var tokens = lex(code);
var sentences = parse(tokens)
console.log(JSON.stringify(sentences, 0, 2));