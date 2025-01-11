import * as LEX  from "./lex.mjs";
import {VarStatement, ReturnStatement, BlockStatement, ExpressionStatement, IdentifierAstNode, AstNode} from './parser_class_v1.mjs'

// 语法解析，把tokens转换为statements
function parse(tokens) {
    var statements = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var statement = null;
        if (token.type === LEX.SEMICOLON) {
            continue;
        } else if (token.type === LEX.EOF || token.type === LEX.RBRACE) {
            break;
        } else if (token.type === LEX.VAR) {
            statement = parseVarStatement(tokens, i);
        } else if (token.type === LEX.RETURN) {
            statement = parseReturnStatement(tokens, i);
        } else if (token.type === LEX.LBRACE){
            statement = parseBlockStatement(tokens, i);
        } else {
            statement = parseExpressionStatement(tokens, i);
        }
        i = statement.endPos;
        statements.push(statement);
    }
    return statements;
}

// 从start开始转换成var语句，校验是不是var xx = xxx;格式，然后需要解析表达式parseExpression函数。
function parseVarStatement(tokens, start) {
    assert(tokens[start].type === LEX.VAR, "VarStatement should start with var");
    assert(tokens[start + 1].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
    assert(tokens[start + 2].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
    var name = new IdentifierAstNode(tokens[start + 1]);
    for (var i = start + 3; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 3, i);
            return new VarStatement(name, value, i);
        }
    }
}

// 与var语句类似
function parseReturnStatement(tokens, start) {
    assert(tokens[start].type === LEX.RETURN, "ReturnStatement should start with return");
    for (var i = start + 1; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 1, i);
            return new ReturnStatement(value, i);
        }
    }
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

// 转换为块语句
function parseBlockStatement(tokens, start) {
    assert(tokens[start].type === LEX.LBRACE, "ReturnStatement should start with LBRACE");
    var statements = parse(tokens.slice(start + 1));
    var endPos = start + 2;
    if (statements.length > 0) {
        endPos = statements[statements.length - 1].endPos + 2;
    }
    assert(tokens[endPos].type === LEX.RBRACE, "ReturnStatement should end with RBRACE");

    return new BlockStatement(statements, endPos);
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
var statements = parse(tokens)
console.log(statements);