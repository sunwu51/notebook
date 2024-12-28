import * as LEX  from "./lex.mjs";
import {VarSentence, ReturnSentence, BlockSentence, ExpressionSentence, IdentifierAstNode, AstNode} from './parser_class_v2.mjs'

function parse(tokens) {
    function parseVarSentence() {
        assert(tokens[i++].type === LEX.VAR, "VarSentence should start with var");
        assert(tokens[i].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
        var name = new IdentifierAstNode(tokens[i++]);
        assert(tokens[i++].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
        for (var x = i; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var value = parseExpression(tokens, x, i);
                return new VarSentence(name, value);
            }
        }
    }
    
    function parseReturnSentence() {
        assert(tokens[i].type === LEX.RETURN, "ReturnSentence should start with return");
        for (var x = i + 1; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var value = parseExpression(tokens, x, i);
                return new ReturnSentence(value);
            }
        }
    }
    
    function parseExpressionSentence() {
        for (var x = i; i < tokens.length; i++) {
            if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.EOF) {
                var expression = parseExpression(tokens, x, i);
                return new ExpressionSentence(expression);
            }
        }
    }
    
    function parseBlockSentence() {
        assert(tokens[i].type === LEX.LBRACE, "ReturnSentence should start with LBRACE");
        var sentences = parse(tokens.slice(i + 1));
        // !! 需要自己给i赋值新的结束位置，因为递归是值传递i的值        
        var count = 1;
        for (i = i + 1; i < tokens.length; i++) {
            if (tokens[i].type === LEX.LBRACE) count++;
            else if (tokens[i].type === LEX.RBRACE) count--;
            if (count == 0) {
                break;
            }
        }

        return new BlockSentence(sentences);
    }
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
        sentences.push(sentence);
    }
    return sentences;
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
var sentences = parse(tokens)
for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}