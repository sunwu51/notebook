import lombok.AllArgsConstructor;
import lombok.ToString;

import java.util.List;

/**
 * @author Frank
 * @date 2025/2/4 20:46
 */


@AllArgsConstructor
@ToString
public class ArrayElement extends Element {
    public List<Element> array;
}

