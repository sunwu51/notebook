;

import com.example.calc.CalcParser;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * @author Frank
 * @date 2025/2/4 20:46
 */


@AllArgsConstructor
@Data
public class FunctionElement extends Element {
    public List<String> params;

    public CalcParser.BlockStatementContext body;

    public Context closureCtx;

    public Element call(String name, List<Element> args, Element _this, Element _super) {
        return Constants.NULL;
    }
}

