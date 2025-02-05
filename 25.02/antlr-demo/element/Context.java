;

import java.util.HashMap;
import java.util.Map;

/**
 * @author Frank
 * @date 2025/2/4 21:19
 */
public class Context {
    public Context parent;
    public Map<String, Element> variables = new HashMap<>();

    public FunCtx funCtx = new FunCtx();
    public ForCtx forCtx = new ForCtx();

    public Context(Context parent) {
        this.parent = parent;
    }

    public void set(String key, Element v) {
        variables.put(key, v);
    }

    public Element get(String key) {
        Element res = null;
        if ((res = variables.get(key)) != null) {
            return res;
        }
        if (parent != null) {
            return parent.get(key);
        }
        return Constants.NULL;
    }

    public void update(String key, Element v) {
        if (variables.get(key) != null) {
            variables.put(key, v);
        }
        if (parent != null) {
            parent.update(key, v);
        }
        throw new IllegalStateException("identifier " + key + " is undefined");
    }

    public void setBreak() {
        this.forCtx.isBreak = true;
        if (forCtx.inFor) return;
        parent.setBreak();
    }

    public void setContinue() {
        this.forCtx.isContinue = true;
        if (forCtx.inFor) return;
        parent.setContinue();
    }

    public void setReturnElement(Element v) {
        this.funCtx.returnElement = v;
        if (this.funCtx.name != null) {
            return;
        }
        parent.setReturnElement(v);
    }

    public static class FunCtx {
        public String name;
        public Element returnElement;
    }

    public static class ForCtx {
        public boolean inFor;
        public boolean isBreak;
        public boolean isContinue;
    }
}
