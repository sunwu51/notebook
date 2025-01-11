export class Statement {
    constructor() {
        this.endPos = -1;
    }
}

export class VarStatement extends Statement {
    constructor(name, value, endPos) {
        super();
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
        this.endPos = endPos;
    }
}

export class ReturnStatement extends Statement {
    constructor(value, endPos) {
        super();
        this.value = value; // 这里的value也是表达式
        this.endPos = endPos;
    }
}

export class BlockStatement extends Statement {
    constructor(statements, endPos) {
        super();
        this.statements = statements;
        this.endPos = endPos;
    }
}

export class ExpressionStatement extends Statement {
    constructor(expression, endPos) {
        super();
        this.expression = expression; // 这里的expression也是表达式
        this.endPos = endPos;
    }
}

export class AstNode {}

export class IdentifierAstNode extends AstNode {
    constructor(token) {
        super();
        this.token = token;
    }
}