import * as LEX  from "./lex.mjs";
import {VarStatement, ReturnStatement, BlockStatement, StringAstNode, BooleanAstNode, ExpressionStatement, NullAstNode, FunctionDeclarationAstNode, precedenceMap, prefixPrecedenceMap, postfixPrecedenceMap} from './parser_class_v3.mjs'
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, GroupAstNode} from './parser_class_v3.mjs'

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    parse() {
        var tokens = this.tokens;
        var statements = [];
        for (;;) {
            var token = tokens[this.cursor];
            var statement = null;
            if (token.type === LEX.SEMICOLON) {
                this.cursor++;
                continue;
            } else if (token.type === LEX.EOF || token.type === LEX.RBRACE) {
                break;
            } if (token.type === LEX.VAR) {
                statement = this.parseVarStatement();
            } else if (token.type === LEX.RETURN) {
                statement = this.parseReturnStatement();
            } else if (token.type === LEX.LBRACE) {
                statement = this.parseBlockStatement();
            } else {
                statement = this.parseExpressionStatement();
            }
            statements.push(statement);
        }
        return statements;
    }
    parseVarStatement() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.VAR, "VarStatement should start with var");
        assert(tokens[this.cursor].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
        var name = new IdentifierAstNode(tokens[this.cursor++]);
        assert(tokens[this.cursor++].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
        for (var x = this.cursor; this.cursor < tokens.length; this.cursor++) {
            if (tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type === LEX.EOF) {
                var value = this.parseExpression(tokens, x);
                return new VarStatement(name, value);
            }
        }
    }
   parseVarStatement() {
        var tokens = this.tokens;
        assert (tokens[this.cursor].type === LEX.VAR);
        assert (tokens[this.cursor + 1].type === LEX.IDENTIFIER);
        assert (tokens[this.cursor + 2].type === LEX.ASSIGN);
        var name = new IdentifierAstNode(tokens[this.cursor + 1]);
        this.cursor = this.cursor + 3
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new VarStatement(name, value);
    }
    parseReturnStatement() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.RETURN, "ReturnStatement should start with return");
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new ReturnStatement(value);
    }
    parseExpressionStatement() {
        var tokens = this.tokens;
        var expression = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new ExpressionStatement(expression);
    }
    parseBlockStatement() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.LBRACE, "brace not open for block statement")
        var result = new BlockStatement(this.parse());
        assert(tokens[this.cursor++].type === LEX.RBRACE, "brace not close for block statement");
        return result
    }
    parseExpression() {
        var tokens = this.tokens;
        var stack = [];
        var mid = null;
        while (true) {
            var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
            if (mid == null) {
                // 如果是前缀运算符，不需要设置left，直接塞到stack
                if (prefixPrecedenceMap[tokens[this.cursor].value]) {
                    stack.push(new PrefixOperatorAstNode(tokens[this.cursor++]));
                    continue;
                } 
                mid = this.nextUnaryNode();
            }
            var opNode = this.getEofOrOperateNode(tokens, this.cursor);
            if (opNode.precedence == 0 && stackTopPrecedence == 0)return mid;
            if (opNode.op.type === LEX.ASSIGN ? opNode.precedence < stackTopPrecedence : opNode.precedence <= stackTopPrecedence) {
                var top = stack.pop();
                top.right = mid;
                mid = top;
            } else {
                opNode.left = mid;
                // 如果是后缀运算符，不需要设置right直接continue
                if (opNode instanceof PostfixOperatorAstNode) {
                    mid = opNode; this.cursor++;
                    continue;
                }
                stack.push(opNode);
                if (opNode.op.type != LEX.LPAREN && opNode.op.type != LEX.LBRACKET) this.cursor++;
                else opNode.precedence = 999;
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
            case LEX.TRUE:
            case LEX.FALSE:
                node = new BooleanAstNode(tokens[this.cursor++]);
                break;
            case LEX.NULL:
                node = new NullAstNode(tokens[this.cursor++]);
                break;
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[this.cursor++]);
                break;    
            case LEX.LPAREN:
                // 递归解析(后面的即可，因为遇到)的时候，parseExpression无法识别，就会结束解析
                this.cursor++;
                // GroupAstNode其实可有可无
                node = new GroupAstNode(this.parseExpression());
                assert(this.tokens[this.cursor++].type == LEX.RPAREN, "group not closed");
                break;
            case LEX.FUNCTION:
                assert(this.tokens[++this.cursor].type == LEX.LPAREN, "function need a lparen");
                this.cursor++;
                var params = [];
                while (tokens[this.cursor].type != LEX.RPAREN) {
                    assert(this.tokens[this.cursor].type == LEX.IDENTIFIER);
                    params.push(new IdentifierAstNode(tokens[this.cursor++]));
                    if (tokens[this.cursor].type == LEX.COMMA) {
                        this.cursor++;
                    }
                }
                this.cursor++;
                var body = this.parseBlockStatement();
                node = new FunctionDeclarationAstNode(startToken, params, body)
                break;
            default:
                throw new Error('unexpected token in nextUnary: ' + tokens[this.cursor].type);
        }
        return node;
    }
    getEofOrOperateNode(tokens, index) {
        var eof = new InfixOperatorAstNode(new LEX.Token(LEX.EOF, 'EOF'));
        if (index >= tokens.length) return eof
        var token = tokens[index];
        if (precedenceMap[token.value] != null) {
            return new InfixOperatorAstNode(tokens[index]);
        }
        if (postfixPrecedenceMap[token.value] != null) {
            return new PostfixOperatorAstNode(tokens[index]);
        }
        // 不需要判断前缀运算符，因为在前面已经判断过了
        return eof;
    }
}

function assert(condition, msg) {
    if (!condition) {
        if (msg) throw new Error(msg);
        throw new Error("assert failed");
    }
}


var code = `var a = 1 * (2 - 3);
    return 1 * 3 - b;
{a * 3 - 1;}
var b = -1 + !(var1 + var2++);
`;

var tokens = LEX.lex(code);
var statements = new Parser(tokens).parse()

for (var i = 0; i < statements.length; i++) {
    console.log(statements[i].toString());
}