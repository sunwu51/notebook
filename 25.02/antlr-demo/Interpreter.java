/**
 * @author Frank
 * @date 2025/2/3 23:34
 */
import com.example.calc.element.*;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;
import java.util.stream.Collectors;

public class Interpreter extends CalcBaseVisitor<Element> {
    Stack<Context> mctxStack = new Stack<>();


    {
        mctxStack.push(new Context(null));
    }

    public Context getMctx() {
        return mctxStack.peek();
    }

    @Override
    public Element visitVarStatement(CalcParser.VarStatementContext ctx) {
        String key = ctx.IDENTIFIER().getText();
        Element value = visitExpression(ctx.expression());
        getMctx().set(key, value);
        return Constants.NULL;
    }

    @Override
    public Element visitReturnStatement(CalcParser.ReturnStatementContext ctx) {
        Element res = visit(ctx.expression());
        getMctx().setReturnElement(res);
        return Constants.NULL;
    }

    @Override
    public Element visitIfStatement(CalcParser.IfStatementContext ctx) {
        Element cond = visit(ctx.cond);
        if (cond.toBooleanElement() == Constants.TRUE) {
            visitBlockStatement(ctx.ifBody);
        } else if (ctx.elseBody != null){
            visitBlockStatement(ctx.elseBody);
        }
        return Constants.NULL;
    }


    @Override
    public Element visitExpresstionStatement(CalcParser.ExpresstionStatementContext ctx) {
        return visit(ctx.expression());
    }

    @Override
    public Element visitBreakStatement(CalcParser.BreakStatementContext ctx) {
        getMctx().setBreak();
        return Constants.NULL;
    }

    @Override
    public Element visitContinueStatement(CalcParser.ContinueStatementContext ctx) {
        getMctx().setContinue();
        return Constants.NULL;
    }

    @Override
    public Element visitForStatement(CalcParser.ForStatementContext ctx) {
        visit(ctx.init);
        while(true) {
            Element cond = visit(ctx.cond);
            if (cond.toBooleanElement() == Constants.FALSE) {
                break;
            }
            Context newCtx = new Context(getMctx());
            newCtx.forCtx.inFor = true;
            visitBlockStatement(ctx.body, newCtx);
            if (newCtx.funCtx.returnElement != null || newCtx.forCtx.isBreak) {
                break;
            }
            visit(ctx.step);
        }
        return  Constants.NULL;
    }

    @Override
    public Element visitBlockStatement(CalcParser.BlockStatementContext ctx) {
        return visitBlockStatement(ctx, new Context(getMctx()));
    }

    @Override
    public Element visitNumber(CalcParser.NumberContext ctx) {
        return new NumberElement(Double.parseDouble(ctx.NUMBER().getText()));
    }

    @Override
    public Element visitString(CalcParser.StringContext ctx) {
        String str = ctx.STRING().getText();
        return new StringElement(str);
    }

    @Override
    public Element visitNull(CalcParser.NullContext ctx) {
        return Constants.NULL;
    }

    @Override
    public Element visitFalse(CalcParser.FalseContext ctx) {
        return Constants.FALSE;
    }

    @Override
    public Element visitTrue(CalcParser.TrueContext ctx) {
        return Constants.TRUE;
    }
    @Override
    public Element visitArray(CalcParser.ArrayContext ctx) {
        List<CalcParser.ExpressionContext> exps = ctx.expression();
        List<Element> array = exps.stream().map(this::visitExpression).collect(Collectors.toList());
        return new ArrayElement(array);
    }

    @Override
    public Element visitObject(CalcParser.ObjectContext ctx) {
        List<CalcParser.PairContext> pairContexts = ctx.pair();
        Map<String, Element> map = new HashMap<>();
        pairContexts.forEach(item -> {
            String key = null;
            if (item.key.getType() == CalcParser.STRING) {
                key = item.key.getText().substring(1, item.key.getText().length() - 1);
            } else {
                key = item.key.getText();
            }
            Element val = visitExpression(item.value);
            map.put(key, val);
        });
        Element e = new Element();
        e.map = map;
        return e;
    }

    @Override
    public Element visitGroup(CalcParser.GroupContext ctx) {
        return visitExpression(ctx.expression());
    }

    @Override
    public Element visitFunction(CalcParser.FunctionContext ctx) {
        List<String> params = ctx.params().IDENTIFIER().stream().map(ParseTree::getText).collect(Collectors.toList());
        CalcParser.BlockStatementContext blockStatementContext = ctx.blockStatement();
        return new FunctionElement(params, blockStatementContext, getMctx());
    }

    @Override
    public Element visitIdent(CalcParser.IdentContext ctx) {
        String name = ctx.IDENTIFIER().getText();
        return getMctx().get(name);
    }


    @Override
    public Element visitNew(CalcParser.NewContext ctx) {
        String clsName = ctx.IDENTIFIER().getText();
        Element cls = getMctx().get(clsName);
        if (cls instanceof ProtoElement) {
            ProtoElement curPrototype = (ProtoElement)cls;
            // protos记录所有父类信息
            Stack<ProtoElement> protos = new Stack<>();
            protos.push(curPrototype);
            ProtoElement next = null;
            while ((next = protos.peek().getPrototype()) != null) {
                protos.push(next);
            }

            Element obj = new Element();
            List<Element> args = ctx.expression().stream().map(this::visitExpression).collect(Collectors.toList());
            Element parent = Constants.NULL;
            while (!protos.isEmpty()) {
                ProtoElement me = protos.pop();
                Element constructor = me.getFromMap("constructor");
                if (constructor == null) {
                    continue;
                }
                if (constructor instanceof FunctionElement) {
                    FunctionElement fun = (FunctionElement) constructor;
                    functionCall(fun, "constructor", args, obj, parent);
                    parent = me;
                } else {
                    throw new IllegalStateException("constructor should be function!");
                }
            }
            return obj;
        }
        throw new IllegalStateException("class " + clsName + " not exist");
    }


    @Override
    public Element visitFunCall(CalcParser.FunCallContext ctx) {
        CalcParser.PointExpressionContext funcIter = ctx.funcIter;
        Element func = null, _this = null, _super =null;
        String name = null;
        name = "<anonymous>";
        List<Element> args = ctx.expression().stream().map(this::visitExpression).collect(Collectors.toList());

        if (funcIter.getText().equals("print")) {
            System.out.println(args);
            return Constants.NULL;
        }

        // funcIter有三种，点形式/[]形式/其他单元组形式
        if (funcIter instanceof CalcParser.PointContext) {
            CalcParser.PointContext tmpCtx = (CalcParser.PointContext) funcIter;
            name = tmpCtx.IDENTIFIER().getText();
            CalcParser.UnaryWrapperContext unaryWrapperContext = (CalcParser.UnaryWrapperContext) tmpCtx.unaryExpression().children.get(0);
            _this = visitUnaryWrapper(unaryWrapperContext);
            func = _this.get(name);
            _super = _this.getPrototype() == null ? Constants.NULL : _this.getPrototype().getPrototype() == null ? Constants.NULL:  _this.getPrototype().getPrototype();
        } else if (funcIter instanceof CalcParser.IndexContext) {
            CalcParser.IndexContext tmpCtx = (CalcParser.IndexContext) funcIter;
            name = tmpCtx.expression().getText();
            CalcParser.UnaryWrapperContext unaryWrapperContext = (CalcParser.UnaryWrapperContext) tmpCtx.unaryExpression().children.get(0);
            _this = visitUnaryWrapper(unaryWrapperContext);
            func = _this.get(name);
            _super = _this.getPrototype() == null ? Constants.NULL : _this.getPrototype().getPrototype() == null ? Constants.NULL:  _this.getPrototype().getPrototype();
        } else {
            CalcParser.UnaryInPointContext tmpCtx = (CalcParser.UnaryInPointContext) funcIter;
            CalcParser.UnaryWrapperContext unaryWrapperContext = (CalcParser.UnaryWrapperContext) tmpCtx.children.get(0);
            name = unaryWrapperContext.getText();
            _this = _super = Constants.NULL;
            func = visitUnaryWrapper(unaryWrapperContext);
        }

        if (!(func instanceof FunctionElement)) {
            throw new IllegalStateException("not a function");
        }
        return functionCall((FunctionElement) func, name, args, _this, _super);
    }



    @Override
    public Element visitPostfix(CalcParser.PostfixContext ctx) {
        // left
        Element left = visit(ctx.left);
        if (!(left instanceof NumberElement)) {
            throw new IllegalStateException("postfix should use in number");
        }
        NumberElement num = (NumberElement) left;
        switch (ctx.op.getType()) {
            case CalcParser.INCREMENT:
                return new NumberElement(num.value ++);
            case CalcParser.DECREMENT:
                return new NumberElement(num.value --);
            default:
                throw new IllegalStateException("not support");
        }
    }


    @Override
    public Element visitPrefix(CalcParser.PrefixContext ctx) {
        // right
        Element right = visit(ctx.right);
        switch (ctx.op.getType()) {
            case CalcParser.INCREMENT:
                if (right instanceof NumberElement) {
                    return new NumberElement(++((NumberElement)right).value);
                } else {
                    throw new IllegalStateException("not support");
                }
            case CalcParser.DECREMENT:
                if (right instanceof NumberElement) {
                    return new NumberElement(--((NumberElement)right).value);
                } else {
                    throw new IllegalStateException("not support");
                }
            case CalcParser.PLUS:
                if (right instanceof NumberElement) {
                    return new NumberElement(((NumberElement)right).value);
                } else {
                    throw new IllegalStateException("not support");
                }
            case CalcParser.MINUS:
                if (right instanceof NumberElement) {
                    return new NumberElement(-((NumberElement)right).value);
                } else {
                    throw new IllegalStateException("not support");
                }
            case CalcParser.NOT:
                return right.toBooleanElement() == Constants.TRUE ? Constants.FALSE : Constants.TRUE;
            default:
                throw new IllegalStateException("not support");
        }
    }

    @Override
    public Element visitComp(CalcParser.CompContext ctx) {
        Element left = visit(ctx.left);
        Element right = visit(ctx.right);
        if (!(left instanceof NumberElement && right instanceof NumberElement)) {
            throw new IllegalStateException("非数字");
        }
        NumberElement l = (NumberElement) left, r = (NumberElement) right;
        switch (ctx.op.getType()) {
            case CalcParser.GT:
                return l.value > r.value ? Constants.TRUE : Constants.FALSE;
            case CalcParser.GTE:
                return l.value >= r.value ? Constants.TRUE : Constants.FALSE;
            case CalcParser.LT:
                return l.value < r.value ? Constants.TRUE : Constants.FALSE;
            case CalcParser.LTE:
                return l.value <= r.value ? Constants.TRUE : Constants.FALSE;
        }
        throw new IllegalStateException("not support");
    }

    @Override
    public Element visitEq(CalcParser.EqContext ctx) {
        Element left = visit(ctx.left);
        Element right = visit(ctx.right);
        boolean ok = false;
        if (left instanceof NumberElement && right instanceof NumberElement) {
            ok = ((NumberElement)left).value == ((NumberElement)right).value;
        } else if (left instanceof StringElement && right instanceof StringElement) {
            ok = ((StringElement)left).value == ((StringElement)right).value;
        } else {
            ok = left == right;
        }
        return ok ? Constants.TRUE : Constants.FALSE;
    }

    public Element visitMul(CalcParser.MulContext ctx) {
        Element left = visit(ctx.left);
        Element right = visit(ctx.right);

        if (!(left instanceof NumberElement && right instanceof NumberElement)) {
            throw new IllegalStateException("非数字");
        }
        NumberElement l = (NumberElement) left, r = (NumberElement) right;

        if (ctx.op.getType() == CalcParser.MULTIPLY) {
            return new NumberElement(l.value * r.value);
        }

        if (ctx.op.getType() == CalcParser.DIVIDE) {
            return new NumberElement(l.value / r.value);
        }

        if (ctx.op.getType() == CalcParser.MODULUS) {
            return new NumberElement(l.value % r.value);
        }

        throw new IllegalStateException("暂时不支持");
    }

    public Element visitAdd(CalcParser.AddContext ctx) {
        Element left = visit(ctx.left);
        Element right = visit(ctx.right);

        if (!(left instanceof NumberElement && right instanceof NumberElement)) {
            throw new IllegalStateException("非数字");
        }
        NumberElement l = (NumberElement) left, r = (NumberElement) right;

        if (ctx.op.getType() == CalcParser.PLUS) {
            return new NumberElement(l.value + r.value);
        }

        if (ctx.op.getType() == CalcParser.MINUS) {
            return new NumberElement(l.value - r.value);
        }
        throw new IllegalStateException("暂时不支持");
    }


    // 函数调用中有块语句，需要包装上下文
    private Element functionCall(FunctionElement ele, String name, List<Element> args, Element _this, Element _super) {
        // 闭包上下文
        Context newCtx = new Context(ele.getClosureCtx());
        for (int i=0; i<ele.getParams().size(); i++) {
            String param = ele.getParams().get(i);
            if (i < args.size()) {
                newCtx.set(param, args.get(i));
            } else {
                newCtx.set(param, Constants.NULL);
            }
        }
        newCtx.funCtx.name = name;
        visitBlockStatement(ele.getBody(), newCtx);
        return newCtx.funCtx.returnElement == null ? Constants.NULL : newCtx.funCtx.returnElement;
    }


    private Element visitBlockStatement(CalcParser.BlockStatementContext ctx, Context mctx) {
        mctxStack.push(mctx);
        Element res = Constants.NULL;
        for (CalcParser.StatementContext statementContext : ctx.statement()) {
            if (getMctx().funCtx.returnElement != null || getMctx().forCtx.isBreak || getMctx().forCtx.isContinue) break;
            res = visitStatement(statementContext);
        }
        mctxStack.pop();
        return res;
    }


    public static void main(String[] args) throws Exception {
        String input = "var arr = [1,2,3]; var obj = {a: 10, b:\"a\"}; print(arr, obj);";
        CalcLexer lexer = new CalcLexer(CharStreams.fromString(input));
        CalcParser parser = new CalcParser(new CommonTokenStream(lexer));
        ParseTree tree = parser.program();
        CalcInterp visitor = new CalcInterp();
        Element result = visitor.visit(tree);
        System.out.println("Result: " + result); // 打印 7
    }
}
