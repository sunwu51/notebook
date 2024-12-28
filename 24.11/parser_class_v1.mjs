export class Sentence {
    constructor() {
        this.endPos = -1;
    }
}

export class VarSentence extends Sentence {
    constructor(name, value, endPos) {
        super();
        this.name = name;   // name本身其实也是个表达式
        this.value = value; // 这里的value是个表达式
        this.endPos = endPos;
    }
}

export class ReturnSentence extends Sentence {
    constructor(value, endPos) {
        super();
        this.value = value; // 这里的value也是表达式
        this.endPos = endPos;
    }
}

export class BlockSentence extends Sentence {
    constructor(sentences, endPos) {
        super();
        this.sentences = sentences;
        this.endPos = endPos;
    }
}

export class ExpressionSentence extends Sentence {
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