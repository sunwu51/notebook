import * as LEX  from "./lex.mjs";
import {VarSentence, ReturnSentence, BlockSentence, ExpressionSentence, IdentifierAstNode, AstNode} from './parser_class_v1.mjs'

// 语法解析，把tokens转换为sentences
function parse(tokens) {
    var sentences = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var sentence = null;
        if (token.type === LEX.SEMICOLON) {
            continue;
        } else if (token.type === LEX.EOF || token.type === LEX.RBRACE) {
            break;
        } else if (token.type === LEX.VAR) {
            sentence = parseVarSentence(tokens, i);
        } else if (token.type === LEX.RETURN) {
            sentence = parseReturnSentence(tokens, i);
        } else if (token.type === LEX.LBRACE){
            sentence = parseBlockSentence(tokens, i);
        } else {
            sentence = parseExpressionSentence(tokens, i);
        }
        i = sentence.endPos;
        sentences.push(sentence);
    }
    return sentences;
}

// 从start开始转换成var语句，校验是不是var xx = xxx;格式，然后需要解析表达式parseExpression函数。
function parseVarSentence(tokens, start) {
    assert(tokens[start].type === LEX.VAR, "VarSentence should start with var");
    assert(tokens[start + 1].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
    assert(tokens[start + 2].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
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
    assert(tokens[start].type === LEX.RETURN, "ReturnSentence should start with return");
    for (var i = start + 1; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 1, i);
            return new ReturnSentence(value, i);
        }
    }
}

// 转换为表达式语句
function parseExpressionSentence(tokens, start) {
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var expression = parseExpression(tokens, start, i);
            return new ExpressionSentence(expression, i);
        }
    }
}

// 转换为块语句
function parseBlockSentence(tokens, start) {
    assert(tokens[start].type === LEX.LBRACE, "ReturnSentence should start with LBRACE");
    var sentences = parse(tokens.slice(start + 1));
    var endPos = start + 2;
    if (sentences.length > 0) {
        endPos = sentences[sentences.length - 1].endPos + 2;
    }
    assert(tokens[endPos].type === LEX.RBRACE, "ReturnSentence should end with RBRACE");

    return new BlockSentence(sentences, endPos);
}

// 这里先放置个空的逻辑，后面再补上
function parseExpression(tokens, start, end) {
    return new AstNode();
}

function assert(condition, msg) {
    if (!condition) {
        if (msg) throw new Error(msg);
        throw new Error("assert failed");
    }
}

var code = `{var a = 1 + 2 * 3 / 4 - 5;}
            return a;
            func(a, b);
`;

var tokens = LEX.lex(code);
var sentences = parse(tokens)
console.log(sentences);