// 更简单的单调栈
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
                // opNode一定是倒数第二个元素，所以就可以简化成下面这样
                opNode.right = nodes.pop(); 
                nodes.pop(); 
                opNode.left = nodes.pop();
                nodes.push(opNode);
            }
            nodes.push(node);
            opNodes.push(node);
        } else {
            break;
        }
    }
    while (opNodes.length > 0) {
        var opNode = opNodes.pop();
        // opNode一定是倒数第二个元素，所以就可以简化成下面这样
        opNode.right = nodes.pop(); 
        nodes.pop(); 
        opNode.left = nodes.pop();
        nodes.push(opNode);
    }
    return nodes[0];
}