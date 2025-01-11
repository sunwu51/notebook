export class Statement {
    constructor(token) {
        this.token = token;
    }
}

// var语句
export class VarStatement extends Statement {
    constructor(token, nameIdentifierAstNode, valueAstNode) {
        super(token);
        this.nameIdentifierAstNode = nameIdentifierAstNode; 
        this.valueAstNode = valueAstNode;
    }
    toString() {
        return `var ${this.nameIdentifierAstNode} = ${this.valueAstNode.toString()};`;
    }
}

// return语句
export class ReturnStatement extends Statement {
    constructor(token, valueAstNode) {
        super(token);
        this.valueAstNode = valueAstNode;
    }
    toString() {
        return `return ${this.valueAstNode.toString()};`;
    }
}

// throw语句，与return格式一致
export class ThrowStatement extends Statement {
    constructor(token, valueAstNode) {
        super(token);
        this.valueAstNode = valueAstNode; // 这里的value也是表达式
    }
    toString() {
        return `throw ${this.valueAstNode.toString()};`;
    }
}


// block语句
export class BlockStatement extends Statement {
    // statements: Statement[]
    constructor(token, statements) {
        super(token);
        this.statements = statements;
    }
    toString() {
        return `{
    ${this.statements.map(it=>it.toString()).join('\n')}
}`
    }
}

// expression语句
export class ExpressionStatement extends Statement {
    // expression: AstNode
    constructor(token, expression) {
        super(token);
        this.expression = expression; // 这里的expression也是表达式
    }
    toString() {
        return this.expression.toString() + ";";
    }
}

// class语句，声明class用
export class ClassStatement extends Statement {
    // name: IdentifierAstNode, parent: IdentifierAstNode|null, methods: Map[IdentifierAstNode: null|AstNode]
    constructor(token, nameIdentifierAstNode, parentIdentifierAstNode, methods) {
        super(token);
        this.nameIdentifierAstNode = nameIdentifierAstNode;
        this.parentIdentifierAstNode = parentIdentifierAstNode;
        this.methods = methods;
    }
    toString() {
        var propStr = [];
        this.methods.forEach((v, k)=> {
            propStr.push(`${k.toString()}${v ? ' = ' + v.toString() : ''};`)
        });
        return `class ${this.nameIdentifierAstNode.toString()} ${this.parentIdentifierAstNode ? 'extends ' + this.parentIdentifierAstNode.toString() : ''}{
    ${propStr.join("\n")}
}`
    }
}
// if语句 if (cond) {} [else {}]
export class IfStatement extends Statement {
    constructor(token, conditionAstNode, ifBlockStatement, elseBlockStatement) {
        super(token);
        this.conditionAstNode = conditionAstNode;
        this.ifBlockStatement = ifBlockStatement;
        this.elseBlockStatement = elseBlockStatement;
    }
    toString() {
        return `if ${this.conditionAstNode.toString()} ${this.ifBlockStatement.toString()} ${this.elseBlockStatement ? `else ${this.elseBlockStatement.toString()}` : ""}
`
    }
}
export class TryCatchStatement extends Statement {
    constructor(startToken, tryBlockStatement, catchParamIdentifierAstNode, catchBlockStatement) {
        super(startToken);
        this.tryBlockStatement = tryBlockStatement;
        this.catchParamIdentifierAstNode = catchParamIdentifierAstNode;
        this.catchBlockStatement = catchBlockStatement;
    }
    toString() {
        return `try ${this.tryBlockStatement.toString()} catch (${this.catchParamIdentifierAstNode.toString()}) ${this.catchBlockStatement.toString()}`;
    }
}
// for语句 for(init; condition; step) {}
export class ForStatement extends Statement {
    // token: forToken init: VarStatement|ExpressionStatement, condition: ExpressionStatement, step: AstNode, body: BlockStatement
    constructor(token, initStatement, conditionStatement, stepAstNode, bodyBlockStatement) {
        super(token);
        this.initStatement = initStatement;
        this.conditionStatement = conditionStatement;
        this.stepAstNode = stepAstNode;
        this.bodyBlockStatement = bodyBlockStatement;
    }
    toString() {
        return `for(${this.initStatement.toString()} ${this.conditionStatement.toString()} ${this.stepAstNode.toString()})${this.bodyBlockStatement.toString()}`
    }
}
// break语句，break关键字字面量
export class BreakStatement extends Statement {    
    constructor(token) {
        super(token);
    }
    toString() { return "break;";}
}
// continue语句，continue关键字字面量
export class ContinueStatement extends Statement { 
    constructor(token) {
        super(token);
    }
    toString() { return "continue;";}
}
// 空语句，用来辅助程序运行
export class EmptyStatement extends Statement {
    constructor() {
        super();
    }
    toString() {
        return ";";
    }
}

// 二元运算符优先级排名表，越大优先级越高
export const precedenceMap = new Map(Object.entries({
    'EOF': 0,
    '=': 10,
    '||': 11, '&&': 12,
    '==': 14, '!=': 14,
    '<': 15, '<=': 15, '>': 15, '>=': 15,
    '<<': 16, '>>': 16, '>>>': 16,
    '+': 17, '-': 17,
    '*': 18, '/': 18, '%': 18,
    '(': 19, // 函数调用
    '[': 300, // 数组索引
    '.': 300,
}))

// 前缀运算符优先级排名表
export const prefixPrecedenceMap = new Map(Object.entries({
    '-': 100,
    '!': 100,
    '~': 100,
    '+': 100,
    '++': 100,
    '--': 100
}));

// 后缀运算符优先级排名表
export const postfixPrecedenceMap = new Map(Object.entries({
    '++': 200,
    '--': 200
}))

// 表达式节点（抽象语法树节点）
export class AstNode {
    constructor(token) {
        this.token = token;
    }
    toString() {
        return `EmptyASTNode`;
    }
}
// 数字字面量
export class NumberAstNode extends AstNode {
    constructor(token) {
        super(token);
    }

    toString() {
        return this.token.value;
    }
}
// 变量名/函数名字面量
export class IdentifierAstNode extends AstNode {
    constructor(token) {
        super(token);
    }

    toString() {
        return this.token.value;
    }
}
// null字面量
export class NullAstNode extends AstNode {
    constructor(token) {
        super(token);
    }
    toString() {
        return "null";
    }
}

// 字符串字面量
export class StringAstNode extends AstNode {
    constructor(token) {
        super(token);
    }
    toString() {
        return this.token.value;
    }
}
// boolean字面量
export class BooleanAstNode extends AstNode {
    constructor(token) {
        super(token);
    }
    toString() {
        return this.token.value;
    }
}
// Map对象声明节点例如 {a: 1, b: 2}
export class MapObjectDeclarationAstNode extends AstNode {
    // paris: [{key: ident/string, value: astNode}, {key: ident/string, value: astNode}, ....]
    constructor(token, pairs) {
        super(token);
        this.pairs = pairs;
    }
    toString() {
        return `{ ${this.pairs.map(pair => `${pair.key}: ${pair.value.toString()}`).join(", ")} }`
    }
}
// 中缀操作符节点
export class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super(token);
        this.op = token;
        this.left = null;
        this.right = null;
        this.precedence = precedenceMap.get(token.value);
        if (this.precedence === undefined) {
            throw new Error(`Invalid infix operator: ${token.value}`);
        }
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value == '(' || this.op.value == '[' ? '' : this.op.value} ${this.right.toString()})`;
    }
}
// 前缀操作符
export class PrefixOperatorAstNode extends AstNode {
    constructor(token, right) {
        super(token);
        this.op = token;
        this.right = right;
        this.precedence = prefixPrecedenceMap.get(token.value);
        if (this.precedence === undefined) {
            throw new Error(`Invalid prefix operator: ${token.value}`);
        }
    }
    toString() {
        return `(${this.op.value} ${this.right.toString()})`;
    }
}
// 后缀操作符
export class PostfixOperatorAstNode extends AstNode {
    constructor(token, left) {
        super(token);
        this.op = token;
        this.left = left;
        this.precedence = postfixPrecedenceMap.get(token.value);
        if (this.precedence === undefined) {
            throw new Error(`Invalid postfix operator: ${token.value}`);
        }
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value})`;
    }
}
// 函数声明
export class FunctionDeclarationAstNode extends AstNode {
    constructor(token, params, body) {
        super(token);
        this.params = params;
        this.body = body;
    }
    toString() {
        return `function(${this.params.join(',')})${this.body.toString()}`;
    }
}
// 函数调用
export class FunctionCallAstNode extends AstNode {
    // funcExpression: AstNode, args: AstNode[]
    constructor(token, funcExpression, args) {
        super(token);
        this.funcExpression = funcExpression;
        this.args = args; // args是ast数组
    }
    toString() {
        return `${this.funcExpression.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}
// 函数调用的参数节点
export class FunctionArgsAstNode extends AstNode {
    constructor(token, args) {
        super(token);
        this.args = args;
    }
    toString() {
        return `(${this.args.map(it=>it.toString()).join(',')})`
    }
}
// 数组声明节点 [1, 2, "a"]
export class ArrayDeclarationAstNode extends AstNode {
    // items: AstNode[]
    constructor(token, items) {
        super(token);
        this.items = items;
    }
    toString() {
        return `[${this.items.map(it=>it.toString()).join(',')}]`
    }
}

// 数组或对象索引节点 [1] ["name"]
export class IndexAstNode extends AstNode {
    constructor(token, index) {
        super(token);
        this.index = index;
    }
    toString() {
        return `[${this.index.toString()}]`
    }
}


// 分组节点
export class GroupAstNode extends AstNode {
    constructor(token, exp) {
        super(token);
        this.exp = exp;
    }
    toString() {
        // 因为小括号已经在运算符的toString中使用了，这里为了更好的凸显使用中文中括号
        return `【${this.exp.toString()}】`
    }
}

// new节点 new Person()
export class NewAstNode extends AstNode {
    // args:Ast
    constructor(token, clsIdentifierAstNode, args) {
        super(token);
        this.clsIdentifierAstNode = clsIdentifierAstNode;
        this.args = args;
    }
    toString() {
        return `new ${this.clsIdentifierAstNode.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}