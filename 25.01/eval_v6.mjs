import { Parser } from '../24.12/parser.mjs';
import * as LEX from '../24.11/lex.mjs';
import { lex } from '../24.11/lex.mjs';
import { BlockStatement, ExpressionStatement, VarStatement, ReturnStatement, IfStatement, ForStatement, BreakStatement, ContinueStatement, ThrowStatement, TryCatchStatement, ClassStatement, NewAstNode } from '../24.12/parse-model.mjs'
import { NumberAstNode, StringAstNode, NullAstNode, IdentifierAstNode, BooleanAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, InfixOperatorAstNode, FunctionCallAstNode, ArrayDeclarationAstNode, GroupAstNode, FunctionDeclarationAstNode, MapObjectDeclarationAstNode, IndexAstNode } from '../24.12/parse-model.mjs'

export class Element {
    constructor(type) {
        this.type = type;
        // 普通对象的属性存到map
        this.map = new Map();
        // 类的属性存到pro
        this.$$pro$$ = new Map();
        this.$$pro$$.set("$$pro$$", new Map());
    }
    setPro(key, value) {
        this.$$pro$$.set(key, value);
    }
    set(key, value) {
        this.map.set(key, value);
    }
    get(key) {
        if (key == "type") return new StringElement(this.type);
        if (this.map.get(key) != undefined) {
            return this.map.get(key);
        }
        if (this.$$pro$$.get(key) != undefined) {
            return this.$$pro$$.get(key);
        }
        // 原型链向上搜索
        var pro = this.$$pro$$.get("$$pro$$")
        while (pro != undefined) {
            if (pro.get(key) != undefined) {
                return pro.get(key);
            }
            pro = pro.get("$$pro$$");
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
        this.$$pro$$ = stringProto;
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
    // array: Element[]
    constructor(array) {
        super('array');
        this.array = array;
        this.$$pro$$ = arrayProto;
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
        try {
            evalBlockStatement(this.body, newCtx);
        } catch (e) {
            if (e instanceof RuntimeError) {
                if (e.element instanceof ErrorElement) {
                    e.element.updateFunctionName(name);
                    e.element.pushStack({position: `${exp.token.line}:${exp.token.pos}`})
                }
            }
            throw e;
        }
        return newCtx.funCtx.returnElement =  newCtx.funCtx.returnElement ?  newCtx.funCtx.returnElement : nil;
    }
}
export class ErrorElement extends Element {
    constructor(msg, stack = []) {
        super('error');
        this.set("msg", jsObjectToElement(msg));
        this.set("stack", jsObjectToElement(stack));
    }
    pushStack(info) {
        this.get("stack").array.push(jsObjectToElement(info));
    }
    updateFunctionName(name) {
        var last = this.get("stack").array[this.get("stack").array.length - 1];
        if (last && last.get("functionName") == nil) {
            last.set("functionName", new StringElement(name));
        }
    }
    toNative() {
        return {
            msg: this.get("msg") ? this.get("msg").toNative() : null,
            stack: this.get("stack") ? this.get("stack").toNative() : null
        }
    }
}

function jsObjectToElement(obj) {
    if (typeof obj === 'number') {
        return new NumberElement(obj);
    } else if (typeof obj === 'string') {
        return new StringElement(obj);
    } else if (typeof obj === 'boolean') {
        return obj ? trueElement: falseElement;
    } else if (obj === null) {
        return nil;
    } else if (Array.isArray(obj)) {
        return new ArrayElement(obj.map(e => jsObjectToElement(e)));
    } else if (obj === null || obj === undefined) {
        return nil;
    }
    // obj类型
    const keys = Object.keys(obj);
    const res = new Element("nomalMap")
    res.map = new Map();
    keys.forEach(key => res.map.set(key, jsObjectToElement(obj[key])));
    return res;
}
export class ProtoElement extends Element {
    // className: string;
    // parent: ProtoElement | null;
    // methods: Map<String, Element>;
    constructor(className, parent, methods) {
        super();
        this.className = className;
        if (parent != undefined) {  
            this.setPro("$$pro$$", parent.$$pro$$);
        }
        if (methods) {
            methods.forEach((v, k) => {
                this.setPro(k, v ? v : nil);
            })
        }
    }
    toString() {
        return "PROTOTYPE"
    }
}
export class NativeFunctionElement extends FunctionElement {
    constructor(jsFunction, params) {
        // body和ctx都不需要
        super(params, null, null);
        this.jsFunction = jsFunction;
    }
    // args : NumberElement / BooleanElement / StringElement / NullElement
    call(name, args, _this, _super, ctx) {
        try {
            // 直接把参数转换成js对象，然后调用jsFunction
            var nativeArgs = args.map(e => e.toNative());

            // 注意这里的_this还是原Element，没有转换成js对象。因为像array的push操作需要修改的是_this的
            var res = this.jsFunction.apply(_this, nativeArgs);

            // 返回值也需要是element，道理与_this一样，转换会导致引用类型变化
            return res ? res : nil;
        } catch (e) {
            throw new RuntimeError("Error calling native method " + name + ":" + e.message);
        }
    }
}

// null / true / false 只有一种，所以采用单例
export const nil = new NullElement(),
trueElement = new BooleanElement(true),
falseElement = new BooleanElement(false);

// 声明运行时的报错
export class RuntimeError extends Error {
    constructor(msg, position, element) {
        super(msg);
        this.element = element ? element: new ErrorElement(msg, [{position}]);
    }
}

class Context {
    constructor(parent) {
        this.variables = new Map();
        this.funCtx = {name : undefined, returnElement: undefined};
        // inFor主要是判断是否在for循环中，当出现break或continue的时候，设置对应的字段，并且从自己开始不断向上找到inFor=true，并将遍历路径上的上下文的对应字段都进行设置。
        this.forCtx = {inFor: false, break: false, continue: false};
        this.parent = parent;
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
    setBreak() {
        this.forCtx.break = true;
        if (this.forCtx.inFor) {
            return; //找到最近的for就结束
        } else if (this.parent) {
            // 不能跨函数
            if (this.funCtx.name) throw new RuntimeError(`break not in for`);
            this.parent.setBreak();
        } else {
            throw new RuntimeError('break not in for');
        }
    }
    setContinue() {
        this.forCtx.continue = true;
        if (this.forCtx.inFor) {
            return; //找到最近的for就结束
        } else if (this.parent) {
            if (this.funCtx.name) throw new RuntimeError(`continue not in for`);
            this.parent.setContinue();
        } else {
            throw new RuntimeError('continue not in for');
        }
    }
}

// 对statement[]求值，最终返回最后一个语句的求值结果
function evalStatements(statements, ctx) {
    var res = nil;
    for (let statement of statements) {
        if (ctx.funCtx.returnElement || ctx.forCtx.break || ctx.forCtx.continue) break;
        try {
            res = evalStatement(statement, ctx);
        } catch(e) {
            if (e instanceof RuntimeError) {
                if (e.stack[e.stack.length-1].position == "") {
                    e.stack[e.stack.length-1].position = `${statement.token.line}:${statement.token.pos}`;
                }
                if (!ctx.parent) { // 根上下文了，则直接结束进程，打印异常堆栈
                    console.error("Uncaught Error: " + e.message);
                    e.element.toNative().stack.forEach(item=> {
                        console.error(` at ${item.functionName ? item.functionName : "__root__"}  ${item.position}`);
                    });
                    // 打印堆栈后，退出运行
                    process.exit(1);
                }
            }
            throw e;
        }
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
    } else if (statement instanceof IfStatement) {
        var condRes = evalExpression(statement.conditionAstNode, ctx);
        if ((condRes instanceof NumberElement) && condRes.value == 0 && statement.elseBlockStatement) {
            evalBlockStatement(statement.elseBlockStatement, new Context(ctx));
        } else if (condRes == nil || condRes == falseElement) {
            if (statement.elseBlockStatement) {
                evalBlockStatement(statement.elseBlockStatement, new Context(ctx));
            }
        } else {
            evalBlockStatement(statement.ifBlockStatement, new Context(ctx));
        }
    } else if (statement instanceof ForStatement) {
        if (statement.initStatement) {
            evalStatement(statement.initStatement, ctx);
        }
        while (true) {
            if (statement.conditionStatement) {
                if (!(statement.conditionStatement instanceof ExpressionStatement)) {
                    throw new RuntimeError("Condition should be an ExpressionStatement", `${statement.token.line}:${statement.token.pos}`);
                }
                var condRes = evalExpression(statement.conditionStatement.expression, ctx);
                if (condRes instanceof NumberElement && condRes.value === 0) {
                    return nil;
                }
                if (condRes == nil || condRes == falseElement) {
                    return nil;
                }
            }
            var newCtx = new Context(ctx);
            newCtx.forCtx.inFor = true;
            evalBlockStatement(statement.bodyBlockStatement, newCtx);
            if (newCtx.forCtx.break || newCtx.funCtx.returnElement) break;
            if (statement.stepAstNode) {
                evalExpression(statement.stepAstNode, ctx);
            }
        }
    } else if (statement instanceof BreakStatement) {
        ctx.setBreak();
    } else if (statement instanceof ContinueStatement) {
        ctx.setContinue();
    } else if (statement instanceof ThrowStatement) { 
        var err = evalExpression(statement.valueAstNode, ctx);
        err.pushStack({functionName : ctx.getFunctionName(), position: `${statement.token.line}:${statement.token.pos}`});
        var jsErr = new RuntimeError(err.get("msg").toNative(), null, err);
        throw jsErr
    } else if (statement instanceof TryCatchStatement) {
        try {
            return evalBlockStatement(statement.tryBlockStatement, new Context(ctx));
        } catch(e) {
            if (e instanceof RuntimeError) {
                var catchCtx = new Context(ctx);
                // try-catch的没机会上翻到函数定义的ctx了，所以主动设置
                e.element.updateFunctionName(ctx.getFunctionName());
                catchCtx.set(statement.catchParamIdentifierAstNode.toString(), e.element);
                evalBlockStatement(statement.catchBlockStatement, catchCtx);
            } else {
                throw e; //未知异常，可能是程序bug了
            }

        }
    } else if (statement instanceof ClassStatement) {
        var parent =  null;
        if (statement.parentIdentifierAstNode) {
            parent = ctx.get(statement.parentIdentifierAstNode.toString());
            if (!(parent instanceof ProtoElement)) {
                throw new RuntimeError("parent class " + 
                    statement.parentIdentifierAstNode.toString() + " must be a class")
            }
        }
        var className = statement.nameIdentifierAstNode.toString();
        var methods = new Map();
        if (statement.methods) {
            statement.methods.forEach((v, k)=> {
                var func = evalExpression(v, ctx);
                if (!(func instanceof FunctionElement)) throw new RuntimeError("method " + k.toString() + " must be a function");
                methods.set(k.toString(), evalExpression(v, ctx));
            });
        }
        // 在语法分析中，我们已经把类中的字段赋值的语法糖写法，转为了在constructor中赋值，所以类中只有方法。
        ctx.set(className, new ProtoElement(className, parent, methods))
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
        return new ArrayElement(exp.items.map(item => evalExpression(item, ctx)));
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
        var fname = null, _this = nil, _super = nil, funcElement = nil;
        // 全局方法
        if (funcExpression instanceof IdentifierAstNode) {
            fname = funcExpression.toString();
            // 注入一个print函数，来辅助调试
            if (fname == 'print') {
                console.log(...(exp.args.map((arg) => evalExpression(arg, ctx).toNative())));
                return nil;
            }
            if (fname == 'error') {
                if (exp.args.length == 0) {
                    throw new RuntimeError("error() takes at least 1 argument",`${exp.token.line}:${exp.token.pos}`);
                }
                var msg = evalExpression(exp.args[0], ctx);
                if (!(msg instanceof StringElement)) {
                    throw new RuntimeError("msg should be a String",`${exp.token.line}:${exp.token.pos}`);
                }
                return new ErrorElement(msg.toNative());
            }
            funcElement = evalExpression(funcExpression, ctx);
        } 
        // 对象方法
        else if (funcExpression instanceof InfixOperatorAstNode) {
            // xx.method() => 先对xx求值，结果赋值给_this；然后找到method这个functionElement
            if ((funcExpression.op.type === LEX.POINT && funcExpression.right instanceof IdentifierAstNode) ||
            (funcExpression.op.type === LEX.LBRACKET && funcExpression.right instanceof StringAstNode)) {
                _this = evalExpression(funcExpression.left, ctx)
                funcElement = _this.get(funcExpression.right.toString());
                fname = funcExpression.right.toString();
                var curClsPro = _this.$$pro$$;
                var parentClsPro = curClsPro ? curClsPro.get("$$pro$$") : null;
                _super = new Element(); // 临时的
                _super.$$pro$$ = parentClsPro ? parentClsPro : new Map();
                // super比较特殊，调用super.xx的时候，父类方法中的this指向自身，而是指向当前的对象
                if (funcExpression.left.toString() === 'super') {
                    _this = ctx.get("this");
                }
            } else {
                throw new RuntimeError("Method format invalid");
            }
        }
        // 其他形式，例如 "b()()",函数的返回值也是个函数，直接去调用
        if (funcElement == nil) {
            funcElement = evalExpression(funcExpression, ctx);
        }
        if (!fname) {
            fname ='<anonymous>'
        }
        
        if (funcElement instanceof FunctionElement) {
            return funcElement.call(fname, exp.args.map((arg) => evalExpression(arg, ctx)), _this, _super, exp);
        } else if (funcExpression.right && funcExpression.right.toString() == "constructor") {
            // 默认构造方法，啥也不做
            return nil;
        } else {
            throw new RuntimeError(`${funcExpression.toString()} is not a function`,`${exp.token.line}:${exp.token.pos}`);
        }
    }
    if (exp instanceof FunctionCallAstNode) {
        var funcExpression = exp.funcExpression;
        var funcElement = null,  _this = null, _super=null, fname = null;
        // 去掉冗余的组
        while (funcExpression instanceof GroupAstNode) {
            funcExpression = funcExpression.exp;
        }
        if (funcExpression instanceof InfixOperatorAstNode) {
            // xx.method
            if ((funcExpression.op.type === LEX.POINT && funcExpression.right instanceof IdentifierAstNode) ||
            (funcExpression.op.type === LEX.LBRACKET && funcExpression.right instanceof StringAstNode)) {
                _this = evalExpression(funcExpression.left, ctx)
                funcElement = _this.get(funcExpression.right.toString());
                fname = funcExpression.right.toString();
                // super比较特殊，调用super.xx的时候，this指向还是当前this而不是super
                if (funcExpression.left.toString() === 'super') {
                    var curClsPro = _this.$$pro$$.get("$$pro$$");
                    var parentClsPro = curClsPro ? curClsPro.get("$$pro$$") : null;
                    _super = new Element(); // 临时的
                    _super.$$pro$$ = parentClsPro ? parentClsPro : new Map();
                    _this = ctx.get("this");
                } else {
                    var curClsPro = _this.$$pro$$.get("$$pro$$");
                    var parentClsPro = curClsPro ? curClsPro.get("$$pro$$") : null;
                    _super = new Element(); // 临时的
                    _super.$$pro$$ = parentClsPro ? parentClsPro : new Map();
                }
            }
        }
        if (!fname) {
            if (funcExpression instanceof IdentifierAstNode) {
                fname = funcExpression.toString();
            } else {
                fname = "uname";
            }
        }
        if (!funcElement) {
            funcElement = evalExpression(funcExpression, ctx);
        }
        if (funcElement instanceof FunctionElement) {
            // newCtx.set("super", superEle);
            return funcElement.call(fname, exp.args.map((arg) => evalExpression(arg, ctx)), _this, _super,  ctx);
        } else if (funcExpression.right && funcExpression.right.toString() == "constructor") {
            // 默认构造方法，啥也不做
            return nil;
        } else {
            throw new RuntimeError(`${funcExpression.toString()} is not a function`, exp.token);
        }
    }
    // new对象
    else if (exp instanceof NewAstNode) {
        var className = exp.clsIdentifierAstNode.toString();
        var args = exp.args.map((arg) => evalExpression(arg, ctx));
        var clsElement = ctx.get(className);
        if (!(clsElement instanceof ProtoElement)) throw new RuntimeError(`${className} is not a class`);
        // 1 创建空对象
        var _this = new Element(className);
        // 2 当前对象原型 指向 类的原型
        var curClsPro = _this.$$pro$$ = clsElement.$$pro$$;
        var parentClsPro = curClsPro.get("$$pro$$"); 
        // 3 this指向空对象，super指向一个只有父类方法（原型）的对象，这样super.只能调用父类方法
        var _super = new Element();
        _super.$$pro$$ = parentClsPro ? parentClsPro : new Map();


        // 4 运行构造方法，原型链一直往上找constructor构造方法，如果全都没有的话，就不执行任何操作
        if (clsElement.get("constructor") && clsElement.get("constructor") != nil) {
            if (!(clsElement.get("constructor") instanceof FunctionElement)) throw new RuntimeError(`${className}.constructor is not a function`); 
            // 运行构造方法，这里用到了call方法的第三第四个参数分别为this和super的指向
            clsElement.get("constructor").call("constructor", args, _this, _super, exp);
        }
        return _this;
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
                var item = evalExpression(prefixOperatorAstNode.right, ctx);
                if (item instanceof NumberElement) {
                    item.value++;
                    return item;
                }
            }
            throw new RuntimeError("++ should only used with number variable", `${prefixOperatorAstNode.op.line}:${prefixOperatorAstNode.op.pos}`);
        case LEX.DECREMENT:
            if (checkSelfOps(prefixOperatorAstNode.right)) {
                var item = evalExpression(prefixOperatorAstNode.right, ctx);
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


// 数组类型的this是ArrayElement，this.array指向内部的Element数组，对这个数组操作即可。
const arrayProto = new ProtoElement();
arrayProto.setPro("at", new NativeFunctionElement(function(index){ return this.array[index]; }));
arrayProto.setPro("length", new NativeFunctionElement(function(){ return new NumberElement(this.array.length); }));
arrayProto.setPro("push", new NativeFunctionElement(function(item){ this.array.push(jsObjectToElement(item)); }));
arrayProto.setPro("pop", new NativeFunctionElement(function(){ return this.array.pop(); }));
arrayProto.setPro("shift", new NativeFunctionElement(function(){ return this.array.shift(); }));
arrayProto.setPro("unshift", new NativeFunctionElement(function(item){ this.array.unshift(jsObjectToElement(item)); }));
arrayProto.setPro("join", new NativeFunctionElement(function(str){ return new StringElement(this.array.map(item=>item.toString()).join(str)); }));

// 字符串的this是StringElement，this.value是原生js字符串，注意所有函数都不会修改这个value，而是返回新的StringElement
const stringProto = new ProtoElement();
stringProto.setPro("length", new NativeFunctionElement(function(c){ return new NumberElement(this.value.length);}));
stringProto.setPro("split", new NativeFunctionElement(function(c){ return new ArrayElement(this.value.split(c).map(item => new StringElement(item)));}));
stringProto.setPro("charAt", new NativeFunctionElement(function(index){ return new StringElement(this.value[index]) }));
stringProto.setPro("indexOf", new NativeFunctionElement(function(str){ return new NumberElement(this.value.indexOf(str)) }));
stringProto.setPro("startsWith", new NativeFunctionElement(function(str){ return this.value.startsWith(str) ? trueElement :falseElement }));
stringProto.setPro("endsWith", new NativeFunctionElement(function(str){ return this.value.endsWith(str) ? trueElement :falseElement }));
stringProto.setPro("replaceAll", new NativeFunctionElement(function(src, des){ return new StringElement(this.value.replaceAll(src, des)) }));
stringProto.setPro("substring", new NativeFunctionElement(function(start, end){ return new StringElement(this.value.substring(start, end)) }));
stringProto.setPro("toUpperCase", new NativeFunctionElement(function(){ return new StringElement(this.value.toUpperCase()) }));
stringProto.setPro("toLowerCase", new NativeFunctionElement(function(){ return new StringElement(this.value.toLowerCase()) }));
stringProto.setPro("trim", new NativeFunctionElement(function(){ return new StringElement(this.value.trim()) }));
stringProto.setPro("trimLeft", new NativeFunctionElement(function(){ return new StringElement(this.value.trimLeft()) }));
stringProto.setPro("trimRight", new NativeFunctionElement(function(){ return new StringElement(this.value.trimRight()) }));
stringProto.setPro("toNumber", new NativeFunctionElement(function(){ return isNaN(this.value) ? new NumberElement(NaN) : new NumberElement(parseFloat(this.value)) }));

import deasync from 'deasync';
import request from 'sync-request';

import fs from 'fs';
export const buildIn = new Map();
// Math库
const math = new ProtoElement('Math');

math.set('random', new NativeFunctionElement(function(max) {
    if (max === undefined) max = 1;
    return new NumberElement(Math.random() * max);
}));

math.set('floor', new NativeFunctionElement(function(num) {
    return new NumberElement(Math.floor(num));
}));

math.set('ceil', new NativeFunctionElement(function(num) {
    return new NumberElement(Math.ceil(num));
}));

math.set('abs', new NativeFunctionElement(function(num) {
    return new NumberElement(Math.abs(num));
}));

buildIn.set("Math", math);

// Time库
const time = new ProtoElement("Time");

time.set('now', new NativeFunctionElement(function() { return new NumberElement(new Date().getTime());}));
time.set('sleep', new NativeFunctionElement(function(ms) { deasync.sleep(ms); return nil}));

buildIn.set("Time", time);

const json = new ProtoElement("JSON");
json.set("stringify", new NativeFunctionElement(function(obj, opt1, opt2) {
    return new StringElement(JSON.stringify(obj, opt1, opt2));
}));

json.set("parse", new NativeFunctionElement(function(str) {
    return jsObjectToElement(JSON.parse(str))
}));
buildIn.set("JSON", json);


// File库
const file = new ProtoElement("File");

file.set("readFile", new NativeFunctionElement(function(filename, charset) {
    try {
        if (!charset) charset = 'UTF-8';
        return new StringElement(fs.readFileSync(filename, charset));
    } catch (e) {
        throw new RuntimeError(e.message)
    }
}));

file.set("writeFile", new NativeFunctionElement(function(filename, content) {
    try {
        fs.writeFileSync(filename, content);
    } catch (e) {
        throw new RuntimeError(e.message);
    }
}));


file.set("appendFile", new NativeFunctionElement(function(filename, content) {
    try {
        fs.appendFileSync(filename, content);
    } catch (e) {
        throw new RuntimeError(e.message);
    }
}));

buildIn.set('File', file);

// http
const http = new ProtoElement('Http')

http.set("request", new NativeFunctionElement(function(method, url, options){
    try {
        var res = request(method, url, options);
        var body = res.getBody().toString();
        var status = res.statusCode;
        return jsObjectToElement({body, status});
    } catch(e) {
        throw new RuntimeError("http request error " + e.message);
    }
}))


buildIn.set("Http", http);




var ctx = new Context();
buildIn.forEach((v, k) => {
    ctx.set(k, v);
})
// var tokens = lex(`
//     print(Math.random());
//     print(Time.now() / 1000);
//     Time.sleep(1000);
//     print(Time.now() / 1000);
//     print(JSON.parse("{\\\"a\\\": 1}"));
//     print(JSON.stringify({a: 1}));
//     `)
// var statements = new Parser(tokens).parse();
// evalStatements(statements, ctx);

var tokens = lex(`
    File.writeFile("A.log", "Hello World 123\\n");
    File.appendFile("A.log", "Hello World 456\\n");
    print(File.readFile("A.log"));
    var res = Http.request("GET", "https://test.xiaogenban1993.com/uuid", {});
    print(JSON.parse(res.body));
    `)
var statements = new Parser(tokens).parse();
evalStatements(statements, ctx);