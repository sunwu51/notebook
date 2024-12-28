// dfs无返回值
import * as LEX from "./lex.mjs";
import {AstNode, IdentifierAstNode, NumberAstNode, InfixOperatorAstNode,precedenceMap} from './parser_class_v2.mjs'
export function parseExpression(tokens, start, preNode) {
    // 第一次调用的时候，preNode也是不传的，我们自己构造一个哨兵节点
    if (start.index === undefined) {
        preNode = new InfixOperatorAstNode(''); preNode.precedence = 0;
        parseExpression(tokens, {index:start},preNode)
        return preNode.right;
    }
    // 我们把变量名改为mid，每次循环中的处理，就是为了决定mid这个中间元素的归属
    // 如果当前操作符优先级比前一个要高，则归当前opNode的left
    // 否则，mid归前一个的right，前一个咋来的呢，是递归传进来的preNode
    var mid = new NumberAstNode(tokens[start.index].value);
    var precedence = preNode.precedence;

    // start数值参数换成对象的原因是，下面的递归会改动这个指针.
    // 而指针的移动是不可逆的，所以要传指针，而不是传值。
    while (start.index < tokens.length - 1 && isValidInfixOperator(tokens[start.index + 1])) {
        var opNode = new InfixOperatorAstNode(tokens[start.index + 1]);
        if (opNode.precedence <= precedence) {
            preNode.right = mid;  // pre赢得mid，pre左右都填充了
            return;
        } else {
            opNode.left = mid;    // opNode赢得mid
            start.index += 2;  // 指针往后移动2个(每次移动2个)，一个数字一个符号
            parseExpression(tokens, start, opNode); // opNode作为preNode，指针往后移动
            mid = opNode;        // opNode的right在递归中填充完毕，此时他作为下一任mid
        }
    }
    preNode.right = mid;
}
function isValidInfixOperator(token) {
    // 在运算符列表中的合法运算符
    return precedenceMap[token.value] !== undefined;
}