import * as LEX  from "../24.11/lex.mjs";
import {VarStatement, ReturnStatement, ThrowStatement, BlockStatement, ExpressionStatement, TryCatchStatement, precedenceMap, IfStatement, ForStatement, BreakStatement, ContinueStatement, EmptyStatement, ClassStatement, prefixPrecedenceMap, postfixPrecedenceMap, MapObjectDeclarationAstNode, BooleanAstNode} from './parse-model.mjs'
import {AstNode, NullAstNode, IndexAstNode, ArrayDeclarationAstNode, FunctionArgsAstNode, IdentifierAstNode, StringAstNode, NumberAstNode, InfixOperatorAstNode, PrefixOperatorAstNode, PostfixOperatorAstNode, GroupAstNode, FunctionDeclarationAstNode, FunctionCallAstNode, NewAstNode} from './parse-model.mjs'

class ParseError extends Error {
    constructor(message, tokens, index) {
        super(message);
        this.tokens = tokens;
        this.index = index;
    }
}
export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.cursor = 0;
    }
    parse() {
        var statements = [];
        for (;;) {
            var item = this.parseStatement();
            if (item == null) break;
            if (item instanceof EmptyStatement) {
                continue;
            }
            statements.push(item);
        }
        return statements;
    }
    parseStatement() {
        var tokens = this.tokens;
        if (this.cursor >= this.tokens.length) {
            return null;
        }
        var token = this.tokens[this.cursor];
        if (token.type === LEX.SEMICOLON) {
            this.cursor++;
            return new EmptyStatement();
        } else if (token.type === LEX.EOF || token.type === LEX.RBRACE || token.type === LEX.RPAREN) {
            return null;
        } if (token.type === LEX.VAR) {
            return this.parseVarStatement();
        } else if (token.type === LEX.RETURN) {
            return this.parseReturnStatement();
        } else if (token.type === LEX.THROW) {
            return  this.parseThrowStatement();
        } else if (token.type === LEX.LBRACE) {
            return this.parseBlockStatement();
        } else if (token.type === LEX.IF) {
            return this.parseIfStatement();
        } else if (token.type === LEX.FOR) {
            return this.parseForStatement();
        } else if (token.type === LEX.BREAK) {
            return new BreakStatement(tokens[this.cursor++]);
        } else if (token.type === LEX.CONTINUE) {
            return new ContinueStatement(tokens[this.cursor++]);
        } else if (token.type === LEX.CLASS) {
            return this.parseClassStatement();
        } else if (token.type === LEX.TRY) {
            return this.parseTryCatchStatement();
        } else if (token.type === LEX.COMMENT) {
            this.cursor++;
            return new EmptyStatement();
        } else {
            return this.parseExpressionStatement();
        }
    }
    // =====================================转换各种语句=====================================
    parseVarStatement() {
        var tokens = this.tokens;
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor, LEX.VAR, "VarStatement should starts with var"); // var
        this.assertTokenType(this.cursor + 1, LEX.IDENTIFIER, "VarStatement should have a name"); // ident
        this.assertTokenType(this.cursor + 2, LEX.ASSIGN, "VarStatement need a =");          // = 
        var name = new IdentifierAstNode(tokens[this.cursor + 1]);
        this.cursor = this.cursor + 3
        var value = this.parseExpression();                            // AstNode
        this.assertTokenType(this.cursor, [LEX.SEMICOLON,LEX.EOF]);
        this.cursor ++;
        return new VarStatement(startToken, name, value);
    }
    parseReturnStatement() {
        var tokens = this.tokens;                                     // throw
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.RETURN, "ReturnStatement should start with return");
        var value = this.parseExpression();                           // AstNode   
        this.assertTokenType(this.cursor, [LEX.SEMICOLON,LEX.EOF]);
        this.cursor ++;
        return new ReturnStatement(startToken, value);
    }
    parseThrowStatement() {
        var tokens = this.tokens;                                     // throw
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.THROW, "ThrowStatement should start with throw");
        var value = this.parseExpression();                           // AstNode
        this.assertTokenType(this.cursor, [LEX.SEMICOLON,LEX.EOF]);
        this.cursor ++;
        return new ThrowStatement(startToken, value);
    }
    parseExpressionStatement() {
        var tokens = this.tokens;
        var startToken = tokens[this.cursor];
        var expression = this.parseExpression();                       // AstNode
        this.assertTokenType(this.cursor, [LEX.SEMICOLON,LEX.EOF]);
        this.cursor ++;
        return new ExpressionStatement(startToken, expression);
    }
    parseBlockStatement() {
        var tokens = this.tokens;
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.LBRACE, "brace not open for block statement"); // {
        var result = new BlockStatement(startToken, this.parse());                                         //   statement[]
        this.assertTokenType(this.cursor++, LEX.RBRACE, "brace not close for block statement");// }
        return result
    }
    parseIfStatement() {
        var tokens = this.tokens;
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.IF, "if statement need a if");                         // if
        this.assertTokenType(this.cursor++, LEX.LPAREN, "if statement need a LPAREN follow if");       // (
        var condition = this.parseExpression();                                                        // condition
        this.assertTokenType(this.cursor++, LEX.RPAREN, "if statement need a RPAREN follow condition");// )
        var ifBody = this.parseBlockStatement();                                                        // {xxx}
        if (tokens[this.cursor].type == LEX.ELSE) {                                                    
            this.cursor++;                                                                              // else
            var elseBody = this.parseBlockStatement();                                                   // {yyy}
        }
        return new IfStatement(startToken, condition, ifBody, elseBody);
    }
    parseForStatement() {
        var token = this.tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.FOR, "for statement need a for");                              // for
        this.assertTokenType(this.cursor++, LEX.LPAREN, "for statement need a LPAREN follow for");             // (
        var init = this.parseStatement();                                                                       // init
        this.assertTokenType(this.cursor - 1, LEX.SEMICOLON, "for statement error need a SEMICOLON after init"); // ;
        var condition = this.parseStatement();                                                                  // condition
        this.assertTokenType(this.cursor - 1, LEX.SEMICOLON, "for statement error need a SEMICOLON after condition");//;
        var step = this.parseExpression();                                                                      // step
        this.assertTokenType(this.cursor++, LEX.RPAREN, "for statement need a RPAREN follow condition");       // )
        var body = this.parseBlockStatement();                                                                  // {}
        return new ForStatement(token, init, condition, step, body);
    }
    parseTryCatchStatement() {
        var startToken = this.tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.TRY, "try-catch statement need a try");
        var tryBlockStatement = this.parseBlockStatement();
        var catchToken = this.tokens[this.cursor++]
        this.assert(catchToken.type === LEX.CATCH, "catch missed");
        this.assertTokenType(this.cursor++, LEX.LPAREN, "parse catch error");
        var catchParamIdentifierAstNode = this.parseExpression();
        this.assert(catchParamIdentifierAstNode instanceof IdentifierAstNode, "catch parameter error");
        this.assertTokenType(this.cursor++, LEX.RPAREN, "parse catch error");
        var catchBlockStatement = this.parseBlockStatement();
        return new TryCatchStatement(startToken, tryBlockStatement, catchParamIdentifierAstNode, catchBlockStatement);
    }
    parseClassStatement() {
        var tokens = this.tokens;
        var startToken = tokens[this.cursor];
        this.assertTokenType(this.cursor++, LEX.CLASS, "class statement should start with class keyword");     // class
        this.assertTokenType(this.cursor, LEX.IDENTIFIER, "class statement need a IDENTIFIER for class name"); // name
        var classNameIdentAstNode = this.parseExpression();
        var parent = null;
        if (tokens[this.cursor].type == LEX.EXTENDS) {                                                          // extends
            this.cursor++;
            var tk = tokens[this.cursor++];
            this.assert(tk.type == LEX.IDENTIFIER, "class statement need a IDENTIFIER for parent class name");       // parent
            parent = new IdentifierAstNode(tk)
        }

        this.assertTokenType(this.cursor++, LEX.LBRACE, "class statement need a LBRACE follow class name");   // {
        // 类中的属性都是 ident;或ident=expr;形式
        var fields = [];
        var methods = new Map();
        var constr = null;
        while (tokens[this.cursor].type != LEX.RBRACE) {                                                       // k1 = v1...
            this.assertTokenType(this.cursor, LEX.IDENTIFIER, "class statement need a IDENTIFIER for property name");
            // class A {age =10;} 是语法糖
            // 转换成 class A {constructor = function() {this.age = 10;}}
            var assign = this.parseExpression();
            if (assign instanceof IdentifierAstNode) {
                var temp = new InfixOperatorAstNode(new LEX.Token(LEX.ASSIGN, "=", 0, 0));
                temp.left = assign;
                temp.right = new NullAstNode(new LEX.Token(LEX.NULL, "null", 0, 0));
                assign = temp;
            }
            // 把字段的赋值 age=1 改为 this.age = 1
            if (assign instanceof InfixOperatorAstNode && assign.op.type == LEX.ASSIGN) {
                if (!(assign.right instanceof FunctionDeclarationAstNode)) {
                    // constructor不能是字段
                    if (assign.left.token.value  === 'constructor') {
                        throw new ParseError("constructor should be a funciton", tokens, this.cursor);
                    }
                    var point = new InfixOperatorAstNode(new LEX.Token(LEX.POINT, ".", 0, 0));
                    point.left = new IdentifierAstNode(new LEX.Token(LEX.IDENTIFIER, "this", 0, 0));
                    point.right = assign.left;
                    assign.left = point;
                    fields.push(assign);
                } else {
                    if (assign.left.token.value === 'constructor') {
                        constr = assign.right;
                    }
                    methods.set(assign.left, assign.right);
                }
            } 
            if (tokens[this.cursor].type == LEX.SEMICOLON) {
                this.cursor++;
            }
        }
        if (!constr) {
            // temp 构造一个super.constructor
            var temp = new InfixOperatorAstNode(new LEX.Token(LEX.POINT, '.'));
            temp.left = new IdentifierAstNode(new LEX.Token(LEX.IDENTIFIER, 'super'));
            temp.right = new IdentifierAstNode(new LEX.Token(LEX.IDENTIFIER, 'constructor'));
            var callSuper = new FunctionCallAstNode(new LEX.Token(), temp, []);
            var blockStatement = new BlockStatement(new LEX.Token());
            blockStatement.statements = [new ExpressionStatement(new LEX.Token(), callSuper)];
            constr = new FunctionDeclarationAstNode(new LEX.Token(), []); // 空函数
            constr.body = blockStatement;
            fields.forEach(f => constr.body.statements.push(new ExpressionStatement(new LEX.Token(), f)));
        } else {
            var first = constr.body.statements.shift();
            // 在js中构造方法中使用this之前必须先调用super，这个判断比较麻烦，直接简化成构造方法中必须第一行就是super()，强制规定。
            if (!first || !(first instanceof ExpressionStatement) || !(first.expression instanceof InfixOperatorAstNode)
                || first.expression.op.type != LEX.LPAREN || first.expression.left.toString() != 'super') {
                throw new ParseError("constructor should start with super()", tokens, this.cursor);
            }
            var temp = new InfixOperatorAstNode(new LEX.Token(LEX.POINT, '.'));
            temp.left = new IdentifierAstNode(new LEX.Token(LEX.IDENTIFIER, 'super'));
            temp.right = new IdentifierAstNode(new LEX.Token(LEX.IDENTIFIER, 'constructor'));
            // super() => super.constructor() 去糖
            first.expression.left = temp;
            constr.body.statements = [first, ...fields.map(f => new ExpressionStatement(f.token, f)), ...constr.body.statements];
        }
        var ct = new LEX.Token(LEX.IDENTIFIER, 'constructor', 0, 0);
        methods.set(new IdentifierAstNode(ct), constr);
        this.assertTokenType(this.cursor++, LEX.RBRACE, "class format invalid");                              // }
        return new ClassStatement(startToken, classNameIdentAstNode, parent, methods)
    }

    // =====================================转换表达式（pratt + stack）=====================================
    parseExpression() {
        var tokens = this.tokens;
        var stack = [];
        var mid = null;
        while (true) {
            var stackTopPrecedence = stack.length == 0? 0: stack[stack.length - 1].precedence;
            if (mid == null) {
                // 如果是前缀运算符，不需要设置left，直接塞到stack
                if (prefixPrecedenceMap.get(tokens[this.cursor].value)) {
                    stack.push(new PrefixOperatorAstNode(tokens[this.cursor++]));
                    continue;
                } 
                mid = this.nextUnaryNode();
            }
            var opNode = this.getEofOrOperateNode(tokens, this.cursor);
            if (opNode.precedence == 0 && stackTopPrecedence == 0)return mid;
            if (opNode.op.type === LEX.ASSIGN ? opNode.precedence < stackTopPrecedence : opNode.precedence <= stackTopPrecedence) {
                var top = stack.pop();
                top.right = mid;
                mid = top;
            } else {
                opNode.left = mid;
                // 如果是后缀运算符，不需要设置right直接continue
                if (opNode instanceof PostfixOperatorAstNode) {
                    mid = opNode; this.cursor++;
                    continue;
                }
                stack.push(opNode);
                if (opNode.op.type != LEX.LPAREN && opNode.op.type != LEX.LBRACKET) this.cursor++;
                else opNode.precedence = 999;
                mid = null;
            }
        }
    }
    nextUnaryNode() {
        var tokens = this.tokens;
        var node = null;
        switch (tokens[this.cursor].type) {
            case LEX.NUMBER:
                node = new NumberAstNode(tokens[this.cursor++]);
                break;
            case LEX.STRING:
                node = new StringAstNode(tokens[this.cursor++]);
                break;
            case LEX.TRUE:
            case LEX.FALSE:
                node = new BooleanAstNode(tokens[this.cursor++]);
                break;
            case LEX.NULL:
                node = new NullAstNode(tokens[this.cursor++]);
                break;
            case LEX.IDENTIFIER:
                node = new IdentifierAstNode(tokens[this.cursor++]);
                break;    
            // 分组或者函数入参
            case LEX.LPAREN:
                // 函数入参
                var startToken = tokens[this.cursor];
                if (this.cursor - 1 >= 0 && (
                    tokens[this.cursor - 1].type == LEX.IDENTIFIER || tokens[this.cursor - 1].type == LEX.RBRACE ||
                    tokens[this.cursor - 1].type == LEX.RPAREN
                )) {
                    this.cursor++;
                    var args = [];
                    while (tokens[this.cursor].type != LEX.RPAREN) {
                        args.push(this.parseExpression());
                        if (tokens[this.cursor].type == LEX.COMMA) {
                            this.cursor++;
                        }
                    }
                    this.cursor++;
                    node = new FunctionArgsAstNode(startToken, args);
                } else {
                    var startToken = tokens[this.cursor];
                    // 递归解析(后面的即可，因为遇到)的时候，parseExpression无法识别，就会结束解析
                    this.cursor++;
                    // GroupAstNode其实可有可无
                    node = new GroupAstNode(startToken, this.parseExpression());
                    this.assertTokenType(this.cursor++, LEX.RPAREN, "group not closed");
                }
                break;
            case LEX.LBRACKET:
                // []用于数组声明和数组索引
                // 数组索引
                var startToken = tokens[this.cursor];
                if (this.cursor - 1 >= 0 && (
                    tokens[this.cursor - 1].type == LEX.IDENTIFIER || tokens[this.cursor - 1].type == LEX.RBRACKET ||
                    tokens[this.cursor - 1].type == LEX.RPAREN || tokens[this.cursor - 1].type == LEX.STRING
                )) {
                    this.cursor ++;
                    var index = this.parseExpression();
                    this.assertTokenType(this.cursor,LEX.RBRACKET);
                    this.cursor ++;
                    node = new IndexAstNode(startToken, index);
                } else {
                    // 数组声明
                    this.cursor++;
                    var items = [];
                    while (tokens[this.cursor].type != LEX.RBRACKET) {
                        var item = this.parseExpression();
                        items.push(item);
                        if (tokens[this.cursor].type == LEX.COMMA) {
                            this.cursor++;
                        }
                    }
                    this.assertTokenType(this.cursor++, LEX.RBRACKET, "array declaration must end with ]");
                    node = new ArrayDeclarationAstNode(startToken, items);
                }
                break;
            case LEX.LBRACE: 
                // {}用于声明普通对象
                this.cursor++;
                var items = [];
                var startToken = tokens[this.cursor];
                while (tokens[this.cursor].type != LEX.RBRACE) {
                    var key = this.parseExpression();
                    this.assertTokenType(this.cursor++, LEX.COLON, "object declaration must have :");
                    var value = this.parseExpression();
                    items.push({key, value});
                    if (tokens[this.cursor].type == LEX.COMMA) {
                        this.cursor++;
                    }
                }
                this.assertTokenType(this.cursor++, LEX.RBRACE, "object declaration must end with }");
                node = new MapObjectDeclarationAstNode(startToken, items);
                break;
            case LEX.FUNCTION:
                var startToken = tokens[this.cursor];
                this.assertTokenType(++this.cursor, LEX.LPAREN, "function need a lparen");
                this.cursor++;
                var params = [];
                while (tokens[this.cursor].type != LEX.RPAREN) {
                    this.assertTokenType(this.cursor, LEX.IDENTIFIER);
                    params.push(new IdentifierAstNode(tokens[this.cursor++]));
                    if (tokens[this.cursor].type == LEX.COMMA) {
                        this.cursor++;
                    }
                }
                this.cursor++;
                var body = this.parseBlockStatement();
                node = new FunctionDeclarationAstNode(startToken, params, body)
                break;
            case LEX.NEW:
                var classNameTk =  tokens[++this.cursor];
                this.assert(classNameTk.type == LEX.IDENTIFIER, "new should be followed by a identifier");
                var className = new IdentifierAstNode(classNameTk);
                this.assertTokenType(++this.cursor, LEX.LPAREN, "class create need a lparen");
                this.cursor++;
                var args = [];
                while (tokens[this.cursor].type != LEX.RPAREN) {
                    args.push(this.parseExpression());
                    if (tokens[this.cursor].type == LEX.COMMA) {
                        this.cursor++;
                    }
                }
                this.cursor++;
                node = new NewAstNode(classNameTk, className, args)
                break;
            default:
                throw new Error('unexpected token in nextUnary: ' + tokens[this.cursor].type);
        }
        return node;
    }

    // =====================================3个辅助函数=====================================
    getEofOrOperateNode(tokens, index) {
        var eof = new InfixOperatorAstNode(new LEX.Token(LEX.EOF, 'EOF'));
        if (index >= tokens.length) return eof
        var token = tokens[index];
        if (precedenceMap.get(token.value) != null) {
            return new InfixOperatorAstNode(tokens[index]);
        }
        if (postfixPrecedenceMap.get(token.value) != null) {
            return new PostfixOperatorAstNode(tokens[index]);
        }
        // 不需要判断前缀运算符，因为在前面已经判断过了
        return eof;
    }
    assertTokenType(index, type, msg) {
        var res = false;
        if (!(type instanceof Array)) type = [type];
        type.forEach(t => res = (res || t === this.tokens[index].type));
        
        if (!res) {
            if (!msg) msg = `tokens[${index}] should be a ${type}, but got ${this.tokens[index].type}`
            throw new ParseError(msg, this.tokens, index);
        }
    }
    assert(condition, msg) {
        if (!condition) {
            throw new ParseError(msg, this.tokens, this.cursor);
        }
    }
}
