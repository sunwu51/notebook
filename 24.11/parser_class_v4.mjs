export class Statement {
}

export class VarStatement extends Statement {
    constructor(name, value) {
        super();
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
    }
    toString() {
        return `var ${this.name} = ${this.value.toString()};`;
    }
}

export class ReturnStatement extends Statement {
    constructor(value) {
        super();
        this.value = value; // 这里的value也是表达式
    }
    toString() {
        return `return ${this.value.toString()};`;
    }
}

export class BlockStatement extends Statement {
    constructor(statements) {
        super();
        this.statements = statements;
    }
    toString() {
        return `{
    ${this.statements.map(it=>it.toString()).join('\n')}
}`
    }
}

export class ExpressionStatement extends Statement {
    constructor(expression) {
        super();
        this.expression = expression; // 这里的expression也是表达式
    }
    toString() {
        return this.expression.toString() + ";";
    }
}

export class ClassStatement extends Statement {
    constructor(name, parent, props) {
        super();
        this.name = name;
        this.parent = parent;
        this.props = props;
    }
    toString() {
        var propStr = [];
        this.props.forEach((v, k)=> {
            propStr.push(`${k.toString()}${v ? ' = ' + v.toString() : ''};`)
        });
        return `class ${this.name.toString()} ${this.parent ? 'extends ' + this.parent.toString() : ''}{
    ${propStr.join("\n")}
}`
    }
}

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
export const prefixPrecedenceMap = new Map(Object.entries({
    '-': 100,
    '!': 100,
    '~': 100,
    '+': 100,
    '++': 100,
    '--': 100
}))
export const postfixPrecedenceMap = new Map(Object.entries({
    '++': 200,
    '--': 200
}))
export class AstNode {
    toString() {
        return `EmptyASTNode`;
    }
}
export class NumberAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}
// 变量名/函数名字面量
export class IdentifierAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }

    toString() {
        return this.token.value;
    }
}
// null字面量
export class NullAstNode extends AstNode {
    toString() {
        return "null";
    }
}

// 字符串字面量
export class StringAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
    toString() {
        return this.token.value;
    }
}
// boolean字面量
export class BooleanAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
    toString() {
        return this.token.value;
    }
}

export class MapObjectDeclarationAstNode extends AstNode {
    // paris: [{key: ident/string, value: astNode}, {key: ident/string, value: astNode}, ....]
    constructor(pairs) {
        super();
        this.pairs = pairs;
    }
    toString() {
        return `{ ${this.pairs.map(pair => `${pair.key}: ${pair.value.toString()}`).join(", ")} }`
    }
}
// 中缀操作符节点
export class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super();
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
        super(false);
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
        super(false);
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
    constructor(params, body) {
        super();
        this.params = params;
        this.body = body;
    }
    toString() {
        return `function(${this.params.join(',')})${this.body.toString()}`;
    }
}
// 函数调用
export class FunctionCallAstNode extends AstNode {
    constructor(name, args) {
        super();
        this.name = name;
        this.args = args; // args是ast数组
    }
    toString() {
        return `${this.name.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}
// 函数调用的参数节点
export class FunctionArgsAstNode extends AstNode {
    constructor(args) {
        super();
        this.args = args;
    }
    toString() {
        return `(${this.args.map(it=>it.toString()).join(',')})`
    }
}

export class ArrayDeclarationAstNode extends AstNode {
    constructor(elements) {
        super();
        this.elements = elements;
    }
    toString() {
        return `[${this.elements.map(it=>it.toString()).join(',')}]`
    }
}

export class IndexAstNode extends AstNode {
    constructor(index) {
        super();
        this.index = index;
    }
    toString() {
        return `[${this.index.toString()}]`
    }
}

export class ArrayIndexAstNode extends AstNode {
    constructor(array, index) {
        super();
        this.array = array;
        this.index = index;
    }
    toString() {
        return `${this.array}[${this.index.toString()}]`
    }
}



// 分组节点
export class GroupAstNode extends AstNode {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString() {
        // 因为小括号已经在运算符的toString中使用了，这里为了更好的凸显使用中文中括号
        return `【${this.exp.toString()}】`
    }
}

export class NewAstNode extends AstNode {
    constructor(cls, args) {
        super();
        this.cls = cls;
        this.args = args;
    }
    toString() {
        return `new ${this.cls.toString()}(${this.args.map(it=>it.toString()).join(',')})`
    }
}
export class IfStatement extends Statement {
    constructor(condition, ifBody, elseBody) {
        super("IF");
        this.condition = condition;
        this.ifBody = ifBody;
        this.elseBody = elseBody;
    }
    toString() {
        return `if ${this.condition.toString()} ${this.ifBody.toString()} ${this.elseBody ? `else ${this.elseBody.toString()}` : ""}
`
    }
}

export class ForStatement extends Statement {
    constructor(init, condition, step, body) {
        super();
        this.init = init;
        this.condition = condition;
        this.step = step;
        this.body = body;
    }
    toString() {
        return `for(${this.init.toString()} ${this.condition.toString()} ${this.step.toString()})${this.body.toString()}`
    }
}
export class BreakStatement extends Statement {    
    constructor(token) {
        super();
        this.token = token;
    }
    toString() { return "break;";}
}
export class ContinueStatement extends Statement { 
    constructor(token) {
        super();
        this.token = token;
    }
    toString() { return "continue;";}
}
export class EmptyStatement extends Statement {
    constructor() {
        super("EMPTY");
    }
    toString() {
        return "";
    }
}