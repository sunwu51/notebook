// 单调栈
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode} from './parser_class_v2.mjs'
export function parseExpression(tokens, start) {
    var nodes = [];
    var opNodes = [];
    for (var i = start; i < tokens.length; i++) {
        var token = tokens[i];
        if (token.type === LEX.NUMBER) {
            nodes.push(new NumberAstNode(token.value));
        } else if (token.type === LEX.PLUS || token.type === LEX.MINUS || token.type === LEX.MULTIPLY || token.type === LEX.DIVIDE) {
            var node = new InfixOperatorAstNode(token);
            while (opNodes.length > 0 && node.precedence <= opNodes[opNodes.length - 1].precedence) {
                var opNode = opNodes.pop();
                var opIndex = nodes.indexOf(opNode); 
                opNode.left = nodes[opIndex - 1];
                opNode.right = nodes[opIndex + 1];
                nodes.splice(opIndex - 1, 3, opNode);
            }
            nodes.push(node);
            opNodes.push(node);
        } else {
            // 无法识别的token结束表达式识别
            break;
        }
    }
    // 遍历完之后，opNode是单调增的优先级，挨着融合即可，或者也可以整合到for循环中，用一个优先级为0的EOF哨兵节点
    // 可以减少下面重复代码，但是为了更好理解，我就把这段代码摘出来放到下面了
    while (opNodes.length > 0) {
        var opNode = opNodes.pop();
        var opIndex = nodes.indexOf(opNode);
        opNode.left = nodes[opIndex - 1];
        opNode.right = nodes[opIndex + 1];
        nodes.splice(opIndex - 1, 3, opNode);
    }
    return nodes[0];
}