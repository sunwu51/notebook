// pratt
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode, precedenceMap} from './parser_class_v2.mjs'

export function parseExpression(tokens, start, precedence=0) {
    // 因为用到递归，并且因为有递归，所以start这个下标的位置需要用引用类型
    // 这样递归更深中的移动，也会在上层改变start的值，所以进入前简单处理下start如果是数字，修改为对象类型
    if (start.index === undefined) {
        return parseExpression(tokens, {index:start}, precedence);
    }
    var leftNode = new NumberAstNode(tokens[start.index].value);
    while (start.index < tokens.length - 1 && isValidInfixOperator(tokens[start.index + 1])) {
        var opNode = new InfixOperatorAstNode(tokens[start.index + 1]);
        if (opNode.precedence <= precedence) {
            return leftNode;
        } else {
            opNode.left = leftNode;
            start.index += 2;
            opNode.right = parseExpression(tokens, start, opNode.precedence);
            leftNode = opNode;
        }
    }
    return leftNode;
}
function isValidInfixOperator(token) {
    // 在运算符列表中的合法运算符
    return precedenceMap[token.value] !== undefined;
}