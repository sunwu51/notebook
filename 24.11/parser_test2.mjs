import * as LEX  from "./lex.mjs";
import {VarStatement, ReturnStatement, BlockStatement, ExpressionStatement, IdentifierAstNode, AstNode} from './parser_class_v2.mjs'

function parse(tokens) {
    function parseVarStatement() {
        assert(tokens[i++].type === LEX.VAR, "VarStatement should start with var");
        assert(tokens[i].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
        var name = new IdentifierAstNode(tokens[i++]);
        assert(tokens[i++].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
        for (var x = i; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var value = parseExpression(tokens, x, i);
                return new VarStatement(name, value);
            }
        }
    }
    
    function parseReturnStatement() {
        assert(tokens[i].type === LEX.RETURN, "ReturnStatement should start with return");
        for (var x = i + 1; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var value = parseExpression(tokens, x, i);
                return new ReturnStatement(value);
            }
        }
    }
    
    function parseExpressionStatement() {
        for (var x = i; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var expression = parseExpression(tokens, x, i);
                return new ExpressionStatement(expression);
            }
        }
    }
    
    function parseBlockStatement() {
        assert(tokens[i].type === LEX.LBRACE, "ReturnStatement should start with LBRACE");
        var statements = parse(tokens.slice(i + 1));
        // !! 需要自己给i赋值新的结束位置，因为递归是值传递i的值        
        var count = 1;
        for (i = i + 1; i < tokens.length; i++) {
            if (tokens[i].type === LEX.LBRACE) count++;
            else if (tokens[i].type === LEX.RBRACE) count--;
            if (count == 0) {
                break;
            }
        }

        return new BlockStatement(statements);
    }
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
        statements.push(statement);
    }
    return statements;
}


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
for (var i = 0; i < statements.length; i++) {
    console.log(statements[i].toString());
}