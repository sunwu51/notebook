// var {lex, Token} = require('./lex.mjs');

// const ASSIGN = 'ASSIGN', LPAREN = 'LPAREN', RPAREN = 'RPAREN', LBRACE = 'LBRACE', RBRACE = 'RBRACE', LBRACKET = 'LBRACKET', RBRACKET = 'RBRACKET',
//     SEMICOLON = 'SEMICOLON', COMMA = 'COMMA', PLUS = 'PLUS', MINUS = 'MINUS', MULTIPLY = 'MULTIPLY', DIVIDE = 'DIVIDE', MODULUS = 'MODULUS', 
//     POINT = 'POINT',
//     AND = 'AND', OR = 'OR', NOT = 'NOT', GT = 'GT', LT = 'LT', GTE = 'GTE', LTE = 'LTE', NEQ = 'NEQ',
//     BAND = 'BAND', BOR = 'BOR', BXOR = 'BXOR', BNOT = 'BNOT', BSHL = 'BSHL', BSHR = 'BSHR';

// const VAR = 'VAR', IDENTIFIER = 'IDENTIFIER', NUMBER = 'NUMBER', STRING = 'STRING', FUNCTION = 'FUNCTION', IF = 'IF', ELSE = 'ELSE', RETURN = 'RETURN', CONTINUE = 'CONTINUE', BREAK = 'BREAK',FOR = "for", WHILE = "while", NEW_LINE='NEW_LINE', EOF = 'EOF';
// // ast节点
// class Node {
//     constructor(type, full) {
//         this.type = type;
//         this.full = full;
//     }
// }

// // identifier节点
// class IdentifierNode extends Node {
//     constructor(name) {
//         super('Identifier', true);
//         this.name = name;
//     }
// }

// // number节点
// class NumberNode extends Node {
//     constructor(value) {
//         super('Number', true);
//         this.value = value;
//     }
// }

// // string节点
// class StringNode extends Node {
//     constructor(value) {
//         super('String', true);
//         this.value = value;
//     }
// }

// // boolean节点
// class BooleanNode extends Node {
//     constructor(value) {
//         super('Boolean', true);
//         this.value = value;
//     }
// }

// // null节点
// class NullNode extends Node {
//     constructor() {
//         super('Null', true);
//     }
// }

// // 前缀运算符节点
// class PrefixOpratorNode extends Node {
//     constructor(op, right) {
//         super('PreOperator', false);
//         this.op = op;
//         this.right = right;
//     }
// }

// // 中缀运算符节点
// class InfixOpratorNode extends Node {
//     constructor( op, left, right) {
//         super('InfixOperator', false);
//         this.left = left;
//         this.op = op;
//         this.right = right;
//     }
// }

// class GroupNode extends Node {
//     constructor(expression) {
//         super('Group', false);
//         this.expression = expression;
//     }
// }
// const precedence = {
//     '*': 2,
//     '/': 2,
//     '+': 1,
//     '-': 1,
// }

// class Parser {
//     constructor(tokens) {
//         this.tokens = tokens;
//         this.pos = 0;
//     }


//     parse() {

//     }

//     parseExpression() {

//         // 遍历token，封装成AstNode节点放到数组中
//         var nodeArr = [];
//         while (this.pos < this.tokens.length) {
//             var item = this.tokens[this.pos++];
//             // 结束/换行符/分号
//             if (item.type === 'EOF' || item.type === 'SEMICOLON' || item.type === 'NEW_LINE') {
//                 break;
//             }
//             var node = null;
//             if (item.type === 'IDENTIFIER') {
//                 node = new IdentifierNode(item.value);
//             } else if (item.type === 'NUMBER') {
//                 node = new NumberNode(item.value);
//             } else if (item.type === 'STRING') {
//                 node = new StringNode(item.value);
//             } else if (item.type === 'BOOLEAN') {
//                 node = new BooleanNode(item.value);
//             } else if (item.type === 'NULL') {
//                 node = new NullNode();
//             } else if (item.type === MULTIPLY || item.type === DIVIDE || item.type === PLUS || item.type === MINUS) {
//                 node = new InfixOpratorNode(item.value, null, null);
//             } else {
//                 throw new Error('unexpected token:' + item.value);
//             }
//             nodeArr.push(node);
//         }

//         // 遍历数组，找到优先级最高的运算符节点，将其左右放入到节点中
//         while (true) {
//             var maxPrecedence = -1, maxIndex = -1;
//             for (var i=0; i<nodeArr.length - 1; i++) {
//                 var node = nodeArr[i];
//                 if (!node.full) {
//                     if (node.type === 'InfixOperator') {
//                         precedence[node.op] > maxPrecedence && (maxPrecedence = precedence[node.op]) && (maxIndex = i);
//                     }
//                 }
//             }
//             if (maxIndex > 0) {
//                 var node = nodeArr[maxIndex];
//                 var pre = nodeArr[maxIndex - 1];
//                 var next = nodeArr[maxIndex + 1];
//                 node.left = pre;
//                 node.right = next;
//                 node.full = true;
//                 nodeArr.splice(maxIndex - 1, 3, nodeArr[maxIndex]);
//             } else {
//                 break;
//             }
//         }
//         return nodeArr[0];
//     }

// }



// var tokens = lex("1 +2*3/4 -5")

// var parser = new Parser(tokens);

// console.log(JSON.stringify(parser.parseExpression(),0,2));
// var res = {
//   "type": "InfixOperator",
//   "full": true,
//   "left": {
//     "type": "InfixOperator",
//     "full": true,
//     "left": {
//       "type": "Number",
//       "full": true,
//       "value": "1"
//     },
//     "op": "+",
//     "right": {
//       "type": "InfixOperator",
//       "full": true,
//       "left": {
//         "type": "InfixOperator",
//         "full": true,
//         "left": {
//           "type": "Number",
//           "full": true,
//           "value": "2"
//         },
//         "op": "*",
//         "right": {
//           "type": "Number",
//           "full": true,
//           "value": "3"
//         }
//       },
//       "op": "/",
//       "right": {
//         "type": "Number",
//         "full": true,
//         "value": "4"
//       }
//     }
//   },
//   "op": "-",
//   "right": {
//     "type": "Number",
//     "full": true,
//     "value": "5"
//   }
// }

import * as LEX  from "./lex.mjs";
import  { lex, Token } from './lex.mjs';

class Sentence {
    constructor(type) {
        this.endPos = -1;
        if (type) {
            this.type = type.toUpperCase() + "_SENTENCE";
        }
    }
}
class Expresstion {}

class VarSentence extends Sentence {
    constructor(name, value, endPos) {
        super("VAR");
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
        this.endPos = endPos;
    }
}

class ReturnSentence extends Sentence {
    constructor(value, endPos) {
        super("RETURN");
        this.value = value; // 这里的value也是表达式
        this.endPos = endPos;
    }
}

class ExpressionStatement extends Sentence {
    constructor(expression, endPos) {
        super("EXPRESSION");
        this.expression = expression; // 这里的expression也是表达式
        this.endPos = endPos;
    }
}

class IdentifierExpression extends Expresstion {
    constructor(str, token) {
        super("IDENTIFIER");
        this.str = str;
        this.token = token;
    }
}
// 语法解析，把tokens转换为sentences
function parse(tokens) {
    var sentences = [];
    for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        var sentence = null;
        if (token.type === LEX.NEW_LINE || token.type === LEX.SEMICOLON) {
            continue;
        } else if (token.type === LEX.EOF) {
            break;
        } if (token.type === LEX.VAR) {
            sentence = parseVarSentence(tokens, i);
        } else if (token.type === LEX.RETURN) {
            sentence = parseReturnSentence(tokens, i);
        } else {
            sentence = parseExpressionStatement(tokens, i);
        }
        i = sentence.endPos;
        sentences.push(sentence);
    }
    return sentences;
}

// 从start开始转换成var语句，校验是不是var xx = xxx;格式，然后需要解析表达式parseExpression函数。
function parseVarSentence(tokens, start) {
    assert (tokens[start].type === LEX.VAR);
    assert (tokens[start + 1].type === LEX.IDENTIFIER);
    assert (tokens[start + 2].type === LEX.ASSIGN);
    var name = new IdentifierExpression(tokens[start + 1].value, tokens[start + 1]);
    for (var i = start + 3; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.NEW_LINE || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 3, i);
            return new VarSentence(name, value, i);
        }
    }
}

// 与var语句类似
function parseReturnSentence(tokens, start) {
    assert (tokens[start].type === LEX.RETURN);
    for (var i = start + 1; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.NEW_LINE || tokens[i].type === LEX.EOF) {
            var value = parseExpression(tokens, start + 1, i);
            return new ReturnSentence(value, i);
        }
    }
}

// 转换为表达式语句
function parseExpressionStatement(tokens, start) {
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i].type === LEX.SEMICOLON || tokens[i].type === LEX.NEW_LINE || tokens[i].type === LEX.EOF) {
            var expression = parseExpression(tokens, start, i);
            return new ExpressionStatement(expression, i);
        }
    }
}

function assert(condition) {
    if (!condition) {
        throw new Error("assert failed");
    }
}


const precedenceMap = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
}
class AstNode {
    constructor(full) {
        if (full === undefined) this.full = false;
        this.full = full;
    }
}
class NumberAstNode extends AstNode {
    constructor(value) {
        super(true);
        this.value = value;
    }
}
class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super(false);
        this.op = token;
        this.left = null;
        this.right = null;
        this.precedence = precedenceMap[token.value];
    }
}
function parseExpression(tokens, start, end) {
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

var code = `var a = 1 + 2 * 3 / 4 - 5;`

var tokens = lex(code);

var sentences = parse(tokens)

console.log(JSON.stringify(sentences, 0, 2));