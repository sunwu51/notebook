import * as LEX  from "./lex.mjs";
import {VarSentence, ReturnSentence, BlockSentence, ExpressionSentence, precedenceMap, IfSentence, ForSentence, BreakSentence, ContinueSentence, EmptySentence} from './parser_class_v3.mjs'
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, GroupAstNode, FunctionDeclarationAstNode, FunctionCallAstNode} from './parser_class_v3.mjs'

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    parse() {
        var sentences = [];
        for (;;) {
            var item = this.parseSentence();
            if (item == null) break;
            if (item instanceof EmptySentence) {
                continue;
            }
            sentences.push(item);
        }
        return sentences;
    }
    parseSentence() {
        var token = tokens[this.cursor];
        if (token.type === LEX.SEMICOLON) {
            this.cursor++;
            return new EmptySentence();
        } else if (token.type === LEX.EOF || token.type === LEX.RBRACE || token.type === LEX.RPAREN) {
            return null;
        } if (token.type === LEX.VAR) {
            return this.parseVarSentence();
        } else if (token.type === LEX.RETURN) {
            return  this.parseReturnSentence();
        } else if (token.type === LEX.LBRACE) {
            return this.parseBlockSentence();
        } else if (token.type === LEX.IF) {
            return this.parseIfSentence();
        } else if (token.type === LEX.FOR) {
            return this.parseForSentence();
        } else if (token.type === LEX.BREAK) {
            return new BreakSentence(tokens[this.cursor++]);
        } else if (token.type === LEX.CONTINUE) {
            return new ContinueSentence(tokens[this.cursor++]);
        } else {
            return this.parseExpressionSentence();
        }
    }
    parseVarSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.VAR, "VarSentence should start with var");
        assert(tokens[this.cursor].type === LEX.IDENTIFIER, "IDENTIFIER should follow var");
        var name = new IdentifierAstNode(tokens[this.cursor++]);
        assert(tokens[this.cursor++].type === LEX.ASSIGN, "ASSIGN should follow IDENT");
        for (var x = this.cursor; this.cursor < tokens.length; this.cursor++) {
            if (tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type === LEX.EOF) {
                var value = this.parseExpression(tokens, x);
                return new VarSentence(name, value);
            }
        }
    }
   parseVarSentence() {
        var tokens = this.tokens;
        assert (tokens[this.cursor].type === LEX.VAR);
        assert (tokens[this.cursor + 1].type === LEX.IDENTIFIER);
        assert (tokens[this.cursor + 2].type === LEX.ASSIGN);
        var name = new IdentifierAstNode(tokens[this.cursor + 1]);
        this.cursor = this.cursor + 3
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new VarSentence(name, value);
    }
    parseReturnSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.RETURN, "ReturnSentence should start with return");
        var value = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new ReturnSentence(value);
    }
    parseExpressionSentence() {
        var tokens = this.tokens;
        var expression = this.parseExpression();
        assert(tokens[this.cursor].type === LEX.SEMICOLON || tokens[this.cursor].type == LEX.EOF);
        this.cursor ++;
        return new ExpressionSentence(expression);
    }
    parseBlockSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type === LEX.LBRACE, "brace not open for block sentence")
        var result = new BlockSentence(this.parse());
        assert(tokens[this.cursor++].type === LEX.RBRACE, "brace not close for block sentence");
        return result
    }
    parseIfSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type == LEX.IF, "if sentence need a if");                         // if
        assert(tokens[this.cursor++].type == LEX.LPAREN, "if sentence need a LPAREN follow if");       // (
        var condition = this.parseExpression();                                                        // condition
        assert(tokens[this.cursor++].type == LEX.RPAREN, "if sentence need a RPAREN follow condition");// )
        var ifBody = this.parseBlockSentence();                                                        // {xxx}
        if (tokens[this.cursor].type == LEX.ELSE) {                                                    
            this.cursor++;                                                                              // else
            var elseBody = this.parseBlockSentence();                                                   // {yyy}
        }
        return new IfSentence(condition, ifBody, elseBody);
    }
    parseForSentence() {
        var tokens = this.tokens;
        assert(tokens[this.cursor++].type == LEX.FOR, "for sentence need a for");
        assert(tokens[this.cursor++].type == LEX.LPAREN, "for sentence need a LPAREN follow for");
        var init = this.parseSentence();
        assert(tokens[this.cursor-1].type == LEX.SEMICOLON, "for sentence error need a SEMICOLON after init");
        var condition = this.parseSentence();
        assert(tokens[this.cursor-1].type == LEX.SEMICOLON, "for sentence error need a SEMICOLON after condition");
        var step = this.parseExpression();
        assert(tokens[this.cursor++].type == LEX.RPAREN, "for sentence need a RPAREN follow condition");
        var body = this.parseBlockSentence();
        return new ForSentence(init, condition, step, body);
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
                var body = this.parseBlockSentence();
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
var sentences = new Parser(tokens).parse()

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}