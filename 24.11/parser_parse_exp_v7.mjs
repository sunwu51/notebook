// pratt栈写法 + 其他字面量 + 前缀后缀运算符
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, precedenceMap} from './parser_class_v3.mjs'
export function parseExpression(tokens, start) {
    var stack = [];
    var i = start, mid = null;
    while (true) {
        // 每个循环，准备好栈顶优先级、中间元素、当前操作符
        var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
        mid = mid == null ? nextUnaryNode() : mid;
        var opNode = getEofOrInfixNode(tokens, i);
        // 结束循环的条件
        if (opNode.precedence == 0 && stackTopPrecedence == 0)return mid;
        // 栈顶操作符赢得mid：弹出栈顶，填充right，并作为新的mid; NULL是EOF是最低优先级
        if (opNode.precedence <= stackTopPrecedence) {
            var top = stack.pop();
            top.right = mid;
            mid = top;
        }
        // 当前操作符赢得mid：塞入栈中，继续向后走
        else {
            opNode.left = mid;
            stack.push(opNode);
            i++;
            mid = null; // 往后走取新的mid
        }
    }
    // 这个函数的定义放到parseExpression函数里面
    function nextUnaryNode() {
        var node = null;
        switch (tokens[i].type) {
            case LEX.NUMBER:
                node = new NumberAstNode(tokens[i++]);
                break;
            case LEX.STRING:
                node = new StringAstNode(tokens[i++]);
                break;
            case LEX.BOOLEAN:
                node = new BooleanAstNode(tokens[i++]);
                break;
            case LEX.NULL:
                node = new NullAstNode(tokens[i++]);
                break;
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[i++]);
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
                node = new PrefixOperatorAstNode(tokens[i++], nextUnaryNode());
                break;
            default:
                throw new Error('unexpected token in getNode: ' + tokens[i].type);
        }
        // 后缀操作符，后缀操作符都是左结合的，并且后缀操作符的优先级比前缀都要高
        while (tokens[i].type == LEX.INCREMENT || tokens[i].type == LEX.DECREMENT) {
            node = new PostfixOperatorAstNode(tokens[i++], node);
        }
        return node;
    }
}
function getEofOrInfixNode(tokens, index) {
    var eof = new InfixOperatorAstNode(new LEX.Token(LEX.EOF, 'EOF'));
    if (index >= tokens.length) return eof
    var token = tokens[index];
    if (precedenceMap[token.value] == null) {
        return eof;
    }
    return new InfixOperatorAstNode(tokens[index]);
} 