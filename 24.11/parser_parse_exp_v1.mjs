// 每次选最高优先级进行合并
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode} from './parser_class_v2.mjs'
export function parseExpression(tokens, start, end) {
    // 1 先把tokens 转成 AstNode数组
    var nodes = [];
    for (var i = start; i < end; i++) {
        var token = tokens[i];
        if (token.type === LEX.NUMBER) {
            nodes.push(new NumberAstNode(token.value));
        } else if (token.type === LEX.PLUS || token.type === LEX.MINUS || token.type === LEX.MULTIPLY || token.type === LEX.DIVIDE) {
            var node = new InfixOperatorAstNode(token);
            nodes.push(node);
        } else {
            throw new Error("unexpected token type: " + token.type);
        }
    }
    // 2 数组元素不为1，则不停地遍历数组，找到最高优先级的，把两边的节点合并进来
    while (nodes.length > 1) {
        var maxPrecedence = -1, maxIndex = -1;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (!node.full && node.precedence > maxPrecedence) {
                maxPrecedence = node.precedence;
                maxIndex = i;
            }
        }
        var maxPrecedenceNode = nodes[maxIndex];
        maxPrecedenceNode.left = nodes[maxIndex - 1];
        maxPrecedenceNode.right = nodes[maxIndex + 1];
        maxPrecedenceNode.full = true;
        // splice函数，把maxInde-1开始往后3个元素，替换为maxPrecedenceNode这一个元素
        nodes.splice(maxIndex - 1, 3, maxPrecedenceNode);
    }
    return nodes[0];
}