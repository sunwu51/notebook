;

import lombok.AllArgsConstructor;
import lombok.ToString;

/**
 * @author Frank
 * @date 2025/2/4 20:46
 */


@AllArgsConstructor
public class StringElement extends Element {
    public String value;

    @Override
    public String toString() {
        return value;
    }
}

