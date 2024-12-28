// pratt栈写法
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, precedenceMap} from './parser_class_v2.mjs'
export function parseExpression(tokens, start) {
    var stack = [];
    var i = start, mid = null;
    while (true) {
        // 每个循环，准备好栈顶优先级、中间元素、当前操作符
        var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
        mid = mid == null ? new NumberAstNode(tokens[i++].value) : mid;
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