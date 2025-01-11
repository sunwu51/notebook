import * as LEX  from "./lex.mjs";
import {VarStatement, ReturnStatement, BlockStatement, ExpressionStatement, precedenceMap, IfStatement, ForStatement, BreakStatement, ContinueStatement, EmptyStatement} from './parser_class_v3.mjs'
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, GroupAstNode, FunctionDeclarationAstNode, FunctionCallAstNode} from './parser_class_v3.mjs'

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    parse() {
        var statements = [];
        for (;;) {
            var item = this.parseStatement();
            if (item == null) break;
            if (item instanceof EmptyStatement) {
                continue;
            }
            statements.push(item);
        }
        return statements;
    }
    parseStatement() {
        var token = tokens[this.cursor];
        if (token.type === LEX.SEMICOLON) {
            this.cursor++;
            return new EmptyStatement();
        } else if (token.type === LEX.EOF || token.type === LEX.RBRACE || token.type === LEX.RPAREN) {
            return null;
        } if (token.type === LEX.VAR) {
            return this.parseVarStatement();
        } else if (token.type === LEX.RETURN) {
            return  this.parseReturnStatement();
        } else if (token.type === LEX.LBRACE) {
            return this.parseBlockStatement();
        } else if (token.type === LEX.IF) {
            return this.parseIfStatement();
        } else if (token.type === LEX.FOR) {
            return this.parseForStatement();
        } else if (token.type === LEX.BREAK) {
            return new BreakStatement(tokens[this.cursor++]);
        } else if (token.type === LEX.CONTINUE) {
            return new ContinueStatement(tokens[this.cursor++]);
        } else {
            return this.parseExpressionStatement();
        }
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
    parseIfStatement() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type == LEX.IF, "if statement need a if");                         // if
        assert(tokens[this.cursor++].type == LEX.LPAREN, "if statement need a LPAREN follow if");       // (
        var condition = this.parseExpression();                                                        // condition
        assert(tokens[this.cursor++].type == LEX.RPAREN, "if statement need a RPAREN follow condition");// )
        var ifBody = this.parseBlockStatement();                                                        // {xxx}
        if (tokens[this.cursor].type == LEX.ELSE) {                                                    
            this.cursor++;                                                                              // else
            var elseBody = this.parseBlockStatement();                                                   // {yyy}
        }
        return new IfStatement(condition, ifBody, elseBody);
    }
    parseForStatement() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type == LEX.FOR, "for statement need a for");
        assert(tokens[this.cursor++].type == LEX.LPAREN, "for statement need a LPAREN follow for");
        var init = this.parseStatement();
        assert(tokens[this.cursor-1].type == LEX.SEMICOLON, "for statement error need a SEMICOLON after init");
        var condition = this.parseStatement();
        assert(tokens[this.cursor-1].type == LEX.SEMICOLON, "for statement error need a SEMICOLON after condition");
        var step = this.parseExpression();
        assert(tokens[this.cursor++].type == LEX.RPAREN, "for statement need a RPAREN follow condition");
        var body = this.parseBlockStatement();
        return new ForStatement(init, condition, step, body);
    }
    parseExpression() {
        var tokens = this.tokens;
        var stack = [];
        var mid = null;
        while (true) {
            var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
            mid = mid == null ? this.nextUnaryNode() : mid;
            var opNode = this.getEofOrInfixNode(tokens, this.cursor);
            if (opNode.precedence == 0 && stackTopPrecedence == 0)return mid;
            if (opNode.op.type === LEX.ASSIGN ? opNode.precedence < stackTopPrecedence : opNode.precedence <= stackTopPrecedence) {
                var top = stack.pop();
                top.right = mid;
                mid = top;
            }
            else {
                opNode.left = mid;
                stack.push(opNode);
                this.cursor++;
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
            case LEX.BOOLEAN:
                node = new BooleanAstNode(tokens[this.cursor++]);
                break;
            case LEX.NULL:
                node = new NullAstNode(tokens[this.cursor++]);
                break;
            // 遇到前缀运算符
            case LEX.PLUS:
            case LEX.MINUS:
            case LEX.INCREMENT:
            case LEX.DECREMENT:
            case LEX.NOT:
            case LEX.BIT_NOT:
                // 前缀后面递归解析一元节点（前缀后面一定是个一元节点）
                // 并且前缀操作符都是右结合的，所以可以直接递归。
                node = new PrefixOperatorAstNode(tokens[this.cursor++], this.nextUnaryNode());
                break;
            // 分组
            case LEX.LPAREN:
                // 递归解析(后面的即可，因为遇到)的时候，parseExpression无法识别，就会结束解析
                this.cursor++;
                // GroupAstNode其实可有可无
                node = new GroupAstNode(this.parseExpression());
                assert(tokens[this.cursor++].type == LEX.RPAREN, "group not closed");
                break;
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[this.cursor++]);
                // 函数调用
                while (tokens[this.cursor].type == LEX.LPAREN) {
                    this.cursor++;
                    var args = [];
                    while (tokens[this.cursor].type != LEX.RPAREN) {
                        args.push(this.parseExpression());
                        if (tokens[this.cursor].type == LEX.COMMA) {
                            this.cursor++;
                        }
                    }
                    this.cursor++;
                    node = new FunctionCallAstNode(node, args);
                }
                break;
            case LEX.FUNCTION:
                assert(tokens[++this.cursor].type == LEX.LPAREN, "function need a lparen");
                this.cursor++;
                var params = [];
                while (tokens[this.cursor].type != LEX.RPAREN) {
                    assert(tokens[this.cursor].type == LEX.IDENTIFIER);
                    params.push(new IdentifierAstNode(tokens[this.cursor++]));
                    if (tokens[this.cursor].type == LEX.COMMA) {
                        this.cursor++;
                    }
                }
                this.cursor++;
                var body = this.parseBlockStatement();
                node = new FunctionDeclarationAstNode(params, body)
                // 函数声明直接调用，与变量的代码一模一样
                while (tokens[this.cursor].type == LEX.LPAREN) {
                    this.cursor++;
                    var args = [];
                    while (tokens[this.cursor].type != LEX.RPAREN) {
                        args.push(this.parseExpression());
                        if (tokens[this.cursor].type == LEX.COMMA) {
                            this.cursor++;
                        }
                    }
                    this.cursor++;
                    node = new FunctionCallAstNode(node, args);
                }
                break;
            default:
                throw new Error('unexpected token in nextUnary: ' + tokens[this.cursor].type);
        }
        // 后缀操作符，后缀操作符都是左结合的，并且后缀操作符的优先级比前缀都要高
        while (tokens[this.cursor].type == LEX.INCREMENT || tokens[this.cursor].type == LEX.DECREMENT) {
            node = new PostfixOperatorAstNode(tokens[this.cursor++], node);
        }
        return node;
    }
    getEofOrInfixNode(tokens, index) {
        var eof = new InfixOperatorAstNode(new LEX.Token(LEX.EOF, 'EOF'));
        if (index >= tokens.length) return eof
        var token = tokens[index];
        if (precedenceMap[token.value] == null) {
            return eof;
        }
        return new InfixOperatorAstNode(tokens[index]);
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
var c = b = a = 1;
var add = function(a,b) {return a +b;};
var res = add(2,add(1, 13))(1)(333,b + a * 3);
var res = function(a,b) {return a +b;}(1,2)(3);

if (a > 1) {
    var a = 1;
}
if (a > b) {
    print(a);
} else {
    print(b);
}
for (var i = 0; i < 10; i++) {
    if (i < 5) {
        print(i);
        continue;
    }
    if (i % 2 == 1) {
        print(i);
        break;
    }
}
`;

var tokens = LEX.lex(code);
var statements = new Parser(tokens).parse()

for (var i = 0; i < statements.length; i++) {
    console.log(statements[i].toString());
}