;

import lombok.ToString;

/**
 * @author Frank
 * @date 2025/2/4 20:47
 */
public class NullElement extends Element {
    public Element get(String key) {
        throw new NullPointerException();
    }
    public Element set(String key) {
        throw new NullPointerException();
    }

    @Override
    public String toString() {
        return "null";
    }
}