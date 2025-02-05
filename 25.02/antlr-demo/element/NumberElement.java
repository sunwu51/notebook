;

import lombok.AllArgsConstructor;
import lombok.ToString;

/**
 * @author Frank
 * @date 2025/2/4 20:46
 */
@AllArgsConstructor
public class NumberElement extends Element {
    public double value;

    @Override
    public String toString() {
        return value + "";
    }
}
