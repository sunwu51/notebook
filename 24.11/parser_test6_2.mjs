import * as LEX  from "./lex.mjs";
import {VarSentence, ReturnSentence, BlockSentence, ExpressionSentence, precedenceMap, prefixPrecedenceMap, postfixPrecedenceMap} from './parser_class_v3.mjs'
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, GroupAstNode} from './parser_class_v3.mjs'

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    parse() {
        var tokens = this.tokens;
        var sentences = [];
        for (;;) {
            var token = tokens[this.cursor];
            var sentence = null;
            if (token.type === LEX.SEMICOLON) {
                this.cursor++;
                continue;
            } else if (token.type === LEX.EOF || token.type === LEX.RBRACE) {
                break;
            } if (token.type === LEX.VAR) {
                sentence = this.parseVarSentence();
            } else if (token.type === LEX.RETURN) {
                sentence = this.parseReturnSentence();
            } else if (token.type === LEX.LBRACE) {
                sentence = this.parseBlockSentence();
            } else {
                sentence = this.parseExpressionSentence();
            }
            sentences.push(sentence);
        }
        return sentences;
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
    // 然后修改parseExpression函数，使其接受一个参数，代表前置符号的优先级
    parseExpression(precedence = 0) {
        var tokens = this.tokens;
        var stack = [];
        var mid = null;
        while (true) {
            // 此时栈为空的时候默认看到的就是上下文传进来的优先级
            var stackTopPrecedence = stack.length == 0 ? precedence: stack[stack.length - 1].precedence;
            mid = mid == null ? this.nextUnaryNode() : mid;
            var opNode = this.getEofOrInfixNode(tokens, this.cursor);
            // 结束循环的条件改为，当前操作符优先级<=上下文优先级 并且 栈为空
            // 这样首先是能兼容为0的情况，其次前缀操作符优先级是比中缀高的，所以前缀操作符传进来的时候一定是遇到中缀就结束
            if (opNode.precedence <= precedence && stackTopPrecedence == precedence) return mid;
            if (opNode.precedence <= stackTopPrecedence) {
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
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[this.cursor++]);
                break;
            // 遇到前缀运算符
            case LEX.PLUS:
            case LEX.MINUS:
            case LEX.INCREMENT:
            case LEX.DECREMENT:
            case LEX.NOT:
            case LEX.BIT_NOT:
                // 使用parseExpression函数递归，但是要传递当前符号的优先级
                node = new PrefixOperatorAstNode(tokens[this.cursor], this.parseExpression(prefixPrecedenceMap[tokens[this.cursor++].value]));
                break;
            // 分组
            case LEX.LPAREN:
                // 递归解析(后面的即可，因为遇到)的时候，parseExpression无法识别，就会结束解析
                this.cursor++;
                // GroupAstNode其实可有可无
                node = new GroupAstNode(this.parseExpression());
                assert(tokens[this.cursor++].type == LEX.RPAREN, "group not closed");
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
        eof.precedence = 0;
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
`;

var tokens = LEX.lex(code);
var sentences = new Parser(tokens).parse()

for (var i = 0; i < sentences.length; i++) {
    console.log(sentences[i].toString());
}