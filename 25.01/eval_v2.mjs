import { Parser } from '../24.12/parser.mjs';
import * as LEX from '../24.11/lex.mjs';
import { lex } from '../24.11/lex.mjs';
import { BlockStatement, ExpressionStatement, VarStatement, ReturnStatement } from '../24.12/parse-model.mjs'
import { NumberAstNode, StringAstNode, NullAstNode, IdentifierAstNode, BooleanAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, InfixOperatorAstNode, FunctionCallAstNode, ArrayDeclarationAstNode, GroupAstNode, FunctionDeclarationAstNode, MapObjectDeclarationAstNode, IndexAstNode } from '../24.12/parse-model.mjs'


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

export class FunctionElement extends Element {
    // params: string[], body: BlockStatement, closureCtx: Context
    constructor(params, body, closureCtx) {
        super('function');
        this.params = params;
        this.body = body;
        // 函数声明的时候的上下文引用
        this.closureCtx = closureCtx;
    }

    toString() {
        return `FUNCTION`
    }

    // name: string, args: Element[], _this: Element, _super: Element, exp: 打印异常堆栈相关
    call(name, args, _this, _super, exp) {
        // 允许长度不匹配和js一样灵活
        // if (args.length != this.params.length) {
        //     throw new RuntimeError(`function ${name+" "}call error: args count not match`);
        // }
        var newCtx = new Context(this.closureCtx);
        if (_this) {
            newCtx.set("this", _this);
        }
        if (_super) {
            newCtx.set("super", _super);
        }
        newCtx.funCtx.name = name;
        this.params.forEach((param, index) => {
            newCtx.set(param, args[index] ? args[index] : nil);
        });
        evalBlockStatement(this.body, newCtx);
        return newCtx.funCtx.returnElement =  newCtx.funCtx.returnElement ?  newCtx.funCtx.returnElement : nil;
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

class Context {
    constructor(parent) {
        this.parent = parent;
        this.variables = new Map();
        this.funCtx = {name: undefined, returnElement: undefined};
    }
    get(name) {
        // 自己有这个变量，就返回这个变量的值
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        // 自己没有，则从parent中不断向上查找
        if (this.parent) {
            return this.parent.get(name);
        }
        // 最后也没有，返回null
        return null;
    }
    // 对应Varstatement
    set(name, value) {
        this.variables.set(name, value);
    }
    // 这个函数中可能又有多个块域，每个都需要设置返回值
    setReturnElement(element) {
        this.funCtx.returnElement = element;
        if (!this.funCtx.name) {
            if (this.parent) this.parent.setReturnElement(element);
            else throw new RuntimeError("return outside function")
        }
    }
    // 获取当前所在的函数名，throw的时候有用
    getFunctionName() {
        if (this.funCtx.name) return this.funCtx.name;
        if (this.parent) return this.parent.getFunctionName();
        return null;
    }
    // 更新变量，对应ASSIGN操作符
    update(name, value) {
        if (this.variables.has(name)) {
            this.set(name, value);
            return;
        } else if (this.parent) {
            this.parent.update(name, value);
            return;
        }
        // 没有声明就更新，直接报错
        throw new RuntimeError(`Identifier ${name} is not defined`);
    }
}

// 对statement[]求值，最终返回最后一个语句的求值结果
function evalStatements(statements, ctx) {
    var res = nil;
    for (let statement of statements) {
        if (ctx.funCtx.returnElement) break;
        res = evalStatement(statement, ctx);
    }
    return res;
}


function evalStatement(statement, ctx) {
    if (statement instanceof ExpressionStatement) {
        return evalExpression(statement.expression, ctx);
    } else if (statement instanceof VarStatement) {
        return evalVarStatement(statement, ctx);
    } else if (statement instanceof BlockStatement) {
        return evalBlockStatement(statement, new Context(ctx));
    } else if (statement instanceof ReturnStatement) {
        ctx.setReturnElement(evalExpression(statement.valueAstNode, ctx));
    }
    // 其他语句暂时不处理返回个nil
    return nil;
}

function evalBlockStatement(blockStatement, ctx) {
    return evalStatements(blockStatement.statements, ctx);
}

function evalVarStatement(varStatement, ctx) {
    if (varStatement instanceof VarStatement) {
        // 对等号之后的表达式求值
        var value = evalExpression(varStatement.valueAstNode, ctx);
        if (value instanceof NumberElement) {
            value = new NumberElement(value.toNative());
        }
        var name = varStatement.nameIdentifierAstNode.toString();
        // 将变量名和对应的值set到一个全局的map中
        ctx.set(name, value);
    }
}

function evalExpression(exp, ctx) {
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
    // 变量值
    else if (exp instanceof IdentifierAstNode) {
        var value = ctx.get(exp.toString());
        if (value) return value;
        // 没有赋值，直接拿来用，抛出异常
        throw new RuntimeError(`Identifier ${exp.toString()} is not defined`, `${exp.token.line}:${exp.token.pos}`);
    }
    // 前缀 后缀 中缀 运算符，单独定义函数
    else if (exp instanceof PrefixOperatorAstNode) {
        return evalPrefixOperator(exp, ctx);
    } else if (exp instanceof PostfixOperatorAstNode) {
        return evalPostfixOperator(exp, ctx);
    } else if (exp instanceof InfixOperatorAstNode) {
        return evalInfixOperator(exp, ctx);
    } 
    // 数组声明 [1,2,3,"a"]，分别对每个item 求值，整合成数组即可
    else if (exp instanceof ArrayDeclarationAstNode) {
        return new ArrayElement(exp.items.map(item => evalExpression(item)));
    } 
    // 分组，直接求里面的表达式即可
    else if (exp instanceof GroupAstNode) {
        return evalExpression(exp.exp, ctx);
    } 
    // 对象声明的节点 {a:1, b: 2, c: {a : 3}}，对于每个key直接按toString求值，value则是递归表达式求值
    // 注意这里声明了一个普通的Element，在map上追加了kv
    else if (exp instanceof MapObjectDeclarationAstNode) {
        var res = new Element("nomalMap");
        exp.pairs.forEach(item => {
            var v = evalExpression(item.value, ctx);
            res.set(item.key.toString(), v);
        });
        return res;
    }
    // 函数声明
    else if (exp instanceof FunctionDeclarationAstNode) {
        return new FunctionElement(exp.params.map(item=>item.toString()), exp.body, ctx);
    }
    // 函数调用
    else if (exp instanceof FunctionCallAstNode) {
        var funcExpression = exp.funcExpression;
        // 去掉冗余的组
        while (funcExpression instanceof GroupAstNode) {
            funcExpression = funcExpression.exp;
        }
        var fname = null;
        if (funcExpression instanceof IdentifierAstNode) {
            fname = funcExpression.toString();
        } else {
            fname = "uname";
        }
        // 注入一个print函数，来辅助调试
        if (fname == 'print') {
            console.log(...(exp.args.map((arg) => evalExpression(arg, ctx).toNative())));
            return nil;
        }
        var funcElement = evalExpression(funcExpression, ctx);
        if (funcElement instanceof FunctionElement) {
            return funcElement.call(fname, exp.args.map((arg) => evalExpression(arg, ctx)), null, null, exp);
        } else {
            throw new RuntimeError(`${funcExpression.toString()} is not a function`,`${exp.token.line}:${exp.token.pos}`);
        }
    }
    // .... 还有其他AstNode稍后再说，先来理解以上几种
    return nil;
}
// 前缀运算符节点求值 + - ! ~
function evalPrefixOperator(prefixOperatorAstNode, ctx) {
    var right = evalExpression(prefixOperatorAstNode.right, ctx);
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
function evalPostfixOperator(postfixOperatorAstNode, ctx) {
    if (checkSelfOps(postfixOperatorAstNode.left)) {
        var left = evalExpression(postfixOperatorAstNode.left, ctx);
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
function evalInfixOperator(infixOperatorAstNode, ctx) {
    switch (infixOperatorAstNode.op.type) {
        // 基础操作符
        case LEX.PLUS:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value + r.value);
            }
            if ((l instanceof StringElement || r instanceof StringElement)) {
                return new StringElement(l.toString() + r.toString());
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MINUS:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value - r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MULTIPLY:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value * r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.DIVIDE:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value / r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.MODULUS:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value % r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.BSHR:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value >> r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.BSHL:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return new NumberElement(l.value << r.value);
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LT:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value < r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.GT:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value > r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LTE:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value <= r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.GTE:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value >= r.value ? trueElement : falseElement;
            }
            throw new RuntimeError(`Invalid infix operator ${infixOperatorAstNode.op.type} for ${l.type} and ${r.type}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.EQ:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value == r.value ? trueElement : falseElement;
            }
            if (l instanceof StringElement && r instanceof StringElement) {
                return l.value == r.value ? trueElement : falseElement;
            }
            return l == r ? trueElement : falseElement;
        case LEX.NEQ:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (l instanceof NumberElement && r instanceof NumberElement) {
                return l.value != r.value ? trueElement : falseElement;
            }
            if (l instanceof StringElement && r instanceof StringElement) {
                return l.value != r.value ? trueElement : falseElement;
            }
            return l != r ? trueElement : falseElement;
        case LEX.AND:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
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
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            var r = evalExpression(infixOperatorAstNode.right, ctx);
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
        // 赋值运算符
        case LEX.ASSIGN:
            var r = evalExpression(infixOperatorAstNode.right, ctx);
            if (infixOperatorAstNode.left instanceof IdentifierAstNode) {
                var l = evalExpression(infixOperatorAstNode.left, ctx);
                if (r instanceof NumberElement) {
                    r = new NumberElement(r.value);
                }
                ctx.update(infixOperatorAstNode.left.toString(), r);
                return  r;
            }
            // 点、index运算符，就不要求值了，直接赋值
            if (infixOperatorAstNode.left instanceof InfixOperatorAstNode) {
                if (infixOperatorAstNode.left.op.type === LEX.POINT) {
                    var lhost = evalExpression(infixOperatorAstNode.left.left, ctx);
                    assert(lhost instanceof Map || lhost instanceof Element, "Point should used on Element", infixOperatorAstNode.left.op);
                    if (r instanceof NumberElement) {
                        r = new NumberElement(r.value);
                    }
                    lhost.set(infixOperatorAstNode.left.right.toString(), r);
                    return r;
                } else if (infixOperatorAstNode.left.op.type === LEX.LBRACKET) {
                    var lhost = evalExpression(infixOperatorAstNode.left.left, ctx);
                    assert(lhost instanceof Map || lhost instanceof Element, "[index] should used after Element", infixOperatorAstNode.left.op);
                    assert(infixOperatorAstNode.left.right instanceof IndexAstNode, "[index] should be IndexAstNode", infixOperatorAstNode.left.op);
                    var index = evalExpression(infixOperatorAstNode.left.right.index, ctx);
                    assert(index instanceof NumberElement || index instanceof StringElement, "[index] should be Number or String", infixOperatorAstNode.left.op);
                    if (r instanceof NumberElement) {
                        r = new NumberElement(r.value);
                    }
                    lhost.set(index.toNative(), r);
                    return r;
                }
            }
            throw new RuntimeError(`Assignment to non-identifier ${infixOperatorAstNode.left.toString()}`, `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        // 点运算符是获取对象的属性，而我们的属性都是存到Element的map中，所以点运算符就是取map的value，对应我们在Element中定义的get方法直接使用即可
        // 后面的LBRACKET运算符也是类似的，只不过后者还支持数组或字符串索引case
        case LEX.POINT:
            var l = evalExpression(infixOperatorAstNode.left, ctx);
            if (l instanceof Element || l instanceof Map) {
                if (infixOperatorAstNode.right instanceof IdentifierAstNode) {
                    return l.get(infixOperatorAstNode.right.toString());
                }
            }
            throw new RuntimeError(". should be after an Element", `${infixOperatorAstNode.op.line}:${infixOperatorAstNode.op.pos}`);
        case LEX.LPAREN: // 小括号运算符特指函数执行
            var functionCall = new FunctionCallAstNode(infixOperatorAstNode.token, infixOperatorAstNode.left, infixOperatorAstNode.right.args);
            return evalExpression(functionCall, ctx);
        case LEX.LBRACKET: // 中括号运算符特指index访问
            assert(infixOperatorAstNode.right instanceof IndexAstNode, "Invalid infix operator usage for []", infixOperatorAstNode.op);
            var index = evalExpression(infixOperatorAstNode.right.index, ctx);
            assert(index instanceof NumberElement || index instanceof StringElement, "[] operator only support number or string index", infixOperatorAstNode.op);
            var target = evalExpression(infixOperatorAstNode.left, ctx);
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

function assert(condition, msg, token) {
    if (!condition) {
        throw new RuntimeError(msg, `${token.line}:${token.pos}`);
    }
}

// var ctx = new Context();
// var tokens = lex(`var a = 1; var b = a; b++;`);
// var statements = new Parser(tokens).parse();
// var res = evalStatements(statements, ctx);
// console.log(ctx);

// var ctx = new Context();
// var tokens = lex(`var a = 1; { var a = 2; var b = 3;}`);
// var statements = new Parser(tokens).parse();
// var res = evalStatements(statements, ctx);
// console.log(ctx);

// var ctx = new Context();
// var tokens = lex(`
//     var a = 1; var b = 2; var c = 3;
//     print("a=" + a + ", b=" + b + ", c=" + c);
//     {
//         var a = 111; var b = 222;
//         print("a=" + a + ", b=" + b + ", c=" + c);
//         a = 999; b = 999; c = 999;
//         print("a=" + a + ", b=" + b + ", c=" + c);
//     }
//     print("a=" + a + ", b=" + b + ", c=" + c);
//     `);
// var statements = new Parser(tokens).parse();
// evalStatements(statements, ctx);

var ctx = new Context();
var tokens = lex(`
    var add = function(a, b) {
        return a + b;
        print("执行不到");
        return -123; // 这里已经执行不到了，第一个return之后的语句都跳过执行
    };
    print(add(add(1, 2), add(3, 4)));

    // 闭包从上下文中捕捉变量
    // add是一个返回函数的函数，而返回的函数，从内部上下文捕捉变量offset=100;
    var offset = 0;
    var add = function() {
        var offset = 100;
        var add = function(a, b) {
            return offset + a + b;
        };
        return add;
    };
    print(add()(1, 2));

    function(a){print(a);}("函数字面量直接调用");

    var obj = {a: 1, b: 2, c: {d: 3, e: "eee"}};
    var arr = [1, 2, 3, 4, 5];
    print(obj.a, obj.b, obj.c.d, obj.c.e, arr[0], arr[1]);
    `);
var statements = new Parser(tokens).parse();
evalStatements(statements, ctx);