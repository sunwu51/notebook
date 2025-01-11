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

export const precedenceMap = {
    'EOF': 0,
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2
}
export class AstNode {
    constructor(full) {
        if (full === undefined) this.full = false;
        this.full = full;
    }
    toString() {
        return `EmptyASTNode`;
    }
}
export class IdentifierAstNode extends AstNode {
    constructor(token) {
        super(true);
        this.token = token;
    }
    toString() {
        return this.token.value;
    }
}
export class NumberAstNode extends AstNode {
    constructor(value) {
        super(true);
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
export class InfixOperatorAstNode extends AstNode {
    constructor(token) {
        super(false);
        this.op = token;
        this.left = null;
        this.right = null;
        this.precedence = precedenceMap[token.value];
    }
    toString() {
        return `(${this.left.toString()} ${this.op.value} ${this.right.toString()})`;
    }
}