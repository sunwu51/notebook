import { Parser } from '../24.12/parser.mjs';
import * as LEX from '../24.11/lex.mjs';
import { lex } from '../24.11/lex.mjs';
import { ExpressionStatement } from '../24.12/parse-model.mjs'
import { NumberAstNode, StringAstNode, NullAstNode, IdentifierAstNode, BooleanAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, InfixOperatorAstNode, FunctionCallAstNode, ArrayDeclarationAstNode } from '../24.12/parse-model.mjs'


export class Element {
    constructor(type) {
        this.type = type;
        this.map = new Map(); // 用来动态追加属性
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        if (key == "type") return new StringElement(this.type);
        if (this.map.get(key) != undefined) {
            return this.map.get(key);
        }
        return nil;
    }
    toString() {
        return `{ ${Array.from(this.map.entries()).map(it=>it[0]+":"+it[1].toString()).join(',')} }`;
    }
    toNative() {
        function elementToJsObject(element) {
            if (element instanceof Element) {
                switch(element.type) {
                    case "number":
                    case "boolean":
                    case "null":
                    case "string":
                    case "array":
                        return element.toNative();
                    default:
                        var iter = element.map.keys();
                        var res = {};
                        var item;
                        while (!(item = iter.next()).done) {
                            var key = item.value;
                            res[key] = elementToJsObject(element.map.get(key))
                        }
                        return res;
                }
            }
            return element;
        }
        return elementToJsObject(this);
    }
}

export class NumberElement extends Element {
    // value是数字或者字符串
    constructor(value) {
        super('number');
        if (isNaN(value) || isNaN(parseFloat(value))) {
            throw new Error('Invalid number');
        }
        this.value = parseFloat(value);
    }
    toNative() {
        return this.value;
    }
    toString() {
        return this.value.toString();
    }
}

export class BooleanElement extends Element {
    constructor(value) {
        super('boolean');
        this.value = value;
    }
    toNative() {
        return this.value;
    }
    toString() {
        return this.value.toString();
    }
}

export class StringElement extends Element {
    constructor(value) {
        super('string');
        this.value = value;
    }
    toNative() {
        return this.value;
    }
    toString() {
        return this.value.toString();
    }
}

export class NullElement extends Element {
    constructor() {
        super('null');
    }
    toNative() {
        return null;
    }
    toString() {
        return "null";
    }
}

export class ArrayElement extends Element {
    // value: Element[]
    constructor(array) {
        super('array');
        this.array = array;
    }
    toString() {
        return `[${this.array.map(v => v.toString()).join(', ')}]`;
    }
    toNative() {
        return this.array.map(e =>e.toNative());
    }
}

// null / true / false 只有一种，所以采用单例
export const nil = new NullElement(),
trueElement = new BooleanElement(true),
falseElement = new BooleanElement(false);

// 声明运行时的报错
export class RuntimeError extends Error {
    constructor(msg, position="") {
        super(msg);
    }
}

// 对statement[]求值，最终返回最后一个语句的求值结果
function evalStatements(statements) {
    var res = nil;
    for (let statement of statements) {
        res = evalStatement(statement);
    }
    return res;
}

function evalStatement(statement) {
    if (statement instanceof ExpressionStatement) {
        return evalExpression(statement.expression);
    }
    // 其他语句暂时不处理返回个nil
    return nil;
}


function evalExpression(exp) {
    // 基础数据类型
    if (exp instanceof NumberAstNode) {
        return new NumberElement(exp.toString());
    } else if (exp instanceof StringAstNode) {
        return new StringElement(exp.toString());
    } else if (exp instanceof NullAstNode) {
        return nil;
    } if (exp instanceof BooleanAstNode) {
        var str = exp.toString();
        if (str == 'true') {
            return trueElement;
        } else if (str == 'false') {
            return falseElement;
        } else {
            throw new Error('invalid boolean');
        }
    } 
    // 前缀 后缀 中缀 运算符，单独定义函数
    else if (exp instanceof PrefixOperatorAstNode) {
        return evalPrefixOperator(exp);
    } else if (exp instanceof PostfixOperatorAstNode) {
        return evalPostfixOperator(exp);
    } else if (exp instanceof InfixOperatorAstNode) {
        return evalInfixOperator(exp);
    } 
    // 数组声明 [1,2,3,"a"]，分别对每个item 求值，整合成数组即可
    else if (exp instanceof ArrayDeclarationAstNode) {
        return new ArrayElement(exp.items.map(item => evalExpression(item)));
    } 
    // 分组，直接求里面的表达式即可
    else if (exp instanceof GroupAstNode) {
        return evalExpression(exp.exp);
    } 
    // 对象声明的节点 {a:1, b: 2, c: {a : 3}}，对于每个key直接按toString求值，value则是递归表达式求值
    // 注意这里声明了一个普通的Element，在map上追加了kv
    else if (exp instanceof MapObjectDeclarationAstNode) {
        var res = new Element("nomalMap");
        exp.pairs.forEach(item => {
            var v = evalExpression(item.value);
            res.set(item.key.toString(), v);
        });
        return res;
    }
    // .... 还有其他AstNode稍后再说，先来理解以上几种
    return nil;
}
// 前缀运算符节点求值 + - ! ~
function evalPrefixOperator(prefixOperatorAstNode) {
    var right = evalExpression(prefixOperatorAstNode.right);
    switch (prefixOperatorAstNode.op.type) {
        case LEX.PLUS:
            if (right instanceof NumberElement) {
                return right;
            } else {
                throw new RuntimeError("+ should only used with numbers", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
            }
        case LEX.MINUS:
            if (right instanceof NumberElement) {
                right.value = -right.value;
                return right;
            } else {
                throw new RuntimeError("- should only used with numbers", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
            }
        case LEX.NOT:
            if (right instanceof BooleanElement) {
                right.value = !right.value;
                return right;
            }
            if (right instanceof NullElement) {
                return trueElement;
            }
            return falseElement;
        case LEX.BIT_NOT:
            if (right instanceof NumberElement) {
                right.value = ~right.value;
                return right;
            } else {
                throw new RuntimeError("~ should only used with numbers", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
            }
        case LEX.INCREMENT:
            if (checkSelfOps(prefixOperatorAstNode.right)) {
                var item = evalExpression(prefixOperatorAstNode.right);
                if (item instanceof NumberElement) {
                    item.value++;
                    return item;
                }
            }
            throw new RuntimeError("++ should only used with number variable", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
        case LEX.DECREMENT:
            if (checkSelfOps(prefixOperatorAstNode.right)) {
                var item = evalExpression(prefixOperatorAstNode.right);
                if (item instanceof NumberElement) {
                    item.value--;
                    return item;
                }
            }
            throw new RuntimeError("-- should only used with number variable", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
        default:
            throw new RuntimeError(`Unsupported prefix operator: ${prefixOperatorAstNode.op.type}`, `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
    }
}

// 后缀运算符节点求值 ++ --
function evalPostfixOperator(postfixOperatorAstNode) {
    if (checkSelfOps(postfixOperatorAstNode.left)) {
        var left = evalExpression(postfixOperatorAstNode.left);
        if (left instanceof NumberElement) {
            // 需要返回一个新的NumberElement对象保持原来的value，原来的对象的value+1
            switch (postfixOperatorAstNode.op.type) {
                case LEX.INCREMENT:
                    return new NumberElement(left.value++);
                case LEX.DECREMENT:
                    return new NumberElement(left.value--);
                default:
                    throw new RuntimeError("unknown postfix operator " + postfixOperatorAstNode.op.type, `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
            }
        }
        throw new RuntimeError("++/-- should only used with number variable", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
    }
}
// ++ --等操作符的使用场景判断：只能用在 a++  p.a++ (p.a)++ 这些场景下
function checkSelfOps(node) {
    if (node instanceof IdentifierAstNode) return true;
    if (node instanceof InfixOperatorAstNode && node.op.type === LEX.POINT && node.right instanceof IdentifierAstNode) return true;
    if (node instanceof InfixOperatorAstNode && node.op.type === LEX.LBRACKET && node.right instanceof IndexAstNode) return true;
    if (node instanceof GroupAstNode) return checkSelfOps(node.exp);
    return false;
}

// 中缀运算符节点求值
function evalInfixOperator(infixOperatorAstNode) {
    switch (infixOperatorAstNode.op.type) {
        // 基础操作符
        case LEX.PLUS:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value + r.value);
            }
            if ((l instanceof StringElement || r instanceof StringElement)) {
                return new StringElement(l.toString() + r.toString());
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MINUS:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value - r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MULTIPLY:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value * r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.DIVIDE:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value / r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MODULUS:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value % r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.BSHR:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value >> r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.BSHL:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value << r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LT:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value < r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.GT:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value > r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LTE:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value <= r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.GTE:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value >= r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.EQ:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value == r.value ? trueElement : falseElement;
            }
            if (l instanceof StringElement && r instanceof StringElement) {
                return l.value == r.value ? trueElement : falseElement;
            }
            return l == r ? trueElement : falseElement;
        case LEX.NEQ:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value != r.value ? trueElement : falseElement;
            }
            if (l instanceof StringElement && r instanceof StringElement) {
                return l.value != r.value ? trueElement : falseElement;
            }
            return l != r ? trueElement : falseElement;
        case LEX.AND:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l == nil || r == nil) {
                return falseElement;
            }
            if (l == falseElement || r == falseElement) {
                return falseElement;
            }
            if (l instanceof NumberElement && l.value == 0) {
                return falseElement;
            }
            if (r instanceof NumberElement && r.value == 0) {
                return falseElement;
            }
            return trueElement;
        case LEX.OR:
            var l = evalExpression(infixOperatorAstNode.left);
            var r = evalExpression(infixOperatorAstNode.right);
            if (l instanceof NumberElement && l.value != 0) {
                return trueElement;
            }
            if (l != nil && l != falseElement) {
                return trueElement;
            }
            if (r instanceof NumberElement && r.value != 0) {
                return trueElement;
            }
            if (r != nil && r != falseElement) {
                return trueElement;
            }
            return falseElement;
        // 点运算符是获取对象的属性，而我们的属性都是存到Element的map中，所以点运算符就是取map的value，对应我们在Element中定义的get方法直接使用即可
        // 后面的LBRACKET运算符也是类似的，只不过后者还支持数组或字符串索引case
        case LEX.POINT:
            var l = evalExpression(infixOperatorAstNode.left);
            if (l instanceof Element || l instanceof Map) {
                if (infixOperatorAstNode.right instanceof IdentifierAstNode) {
                    return l.get(infixOperatorAstNode.right.toString());
                }
            }
            throw new RuntimeError(". should be after an Element", `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LPAREN: // 小括号运算符特指函数执行
            var functionCall = new FunctionCallAstNode(infixOperatorAstNode.token, infixOperatorAstNode.left, infixOperatorAstNode.right.args);
            return evalExpression(functionCall);
        case LEX.LBRACKET: // 中括号运算符特指index访问
            assert(infixOperatorAstNode.right instanceof IndexAstNode, "Invalid infix operator usage for []", infixOperatorAstNode.op);
            var index = evalExpression(infixOperatorAstNode.right.index);
            assert(index instanceof NumberElement || index instanceof StringElement, "[] operator only support number or string index", infixOperatorAstNode.op);
            var target = evalExpression(infixOperatorAstNode.left);
            // 数组/字符串 [数字]
            if (index instanceof NumberElement) {
                assert(target instanceof ArrayElement || target instanceof StringElement, "[number] operator only support array or string index", infixOperatorAstNode.op);
                if (target instanceof ArrayElement) {
                    return target.array[index.value];
                } else {
                    return new StringElement(target.value.charAt(index.value));
                }
            }
            // obj["字符串"]
            if (target instanceof Element) {
                return target.get(index.value);
            }
            throw new RuntimeError("Invalid infix operator usage for []", `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        default:
            throw new RuntimeError(`Unknown operator ${infixOperatorAstNode.toString()}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
    }
}

function assert(condition, msg) {
    if (!condition) {
        throw new ParseError(msg, this.tokens, this.cursor);
    }
}

var tokens = lex(`1 + 2 * 3 / 4 - 5;`);
var statements = new Parser(tokens).parse();
var res = evalStatements(statements);
console.log(res);