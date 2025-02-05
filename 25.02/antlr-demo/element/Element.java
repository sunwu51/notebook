;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * @author Frank
 * @date 2025/2/4 19:45
 */
public class Element {

    public Map<String, Element> map = new HashMap<>();

    public Element get(String key) {
        Element res = null;

        // 自身属性
        if ((res = map.get(key)) != null) {
            return res;
        }

        // 原型链
        Element prototype = map.get("$$pro$$");
        if (prototype != null) {
            return prototype.get(key);
        }
        return Constants.NULL;
    }

    public Element getFromMap(String key) {
        return map.get(key);
    }

    public void set(String key, Element value) {
        if (Objects.equals(key, "$$pro$$")) {
            throw new IllegalStateException("Protected property");
        }
        map.put(key, value);
    }

    public ProtoElement getPrototype() {
        Element res = map.get("$$pro$$");
        if (res == null) {
            return null;
        }
        return (ProtoElement) res;
    }

    public String toString() {
        return map.toString();
    }

    public BooleanElement toBooleanElement() {
        if (this instanceof BooleanElement) {
            return (BooleanElement)this;
        }
        if (this instanceof NullElement) {
            return (BooleanElement)Constants.FALSE;
        }
        if (this instanceof NumberElement) {
            if (((NumberElement)this).value == 0.0) {
                return (BooleanElement)Constants.FALSE;
            }
        }
        return (BooleanElement)Constants.TRUE;
    }

}
