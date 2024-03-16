import jexer.TAction;
import jexer.TApplication;
import jexer.TCheckBox;
import jexer.TComboBox;
import jexer.TField;
import jexer.TText;
import jexer.TWidget;
import jexer.TWindow;
import jexer.TApplication.BackendType;
import jexer.event.TMenuEvent;
import jexer.menu.TMenu;

import java.util.*;

public class JexerDemo extends TApplication {
    TWindow mainWindow;

    public JexerDemo() throws Exception {
        super(BackendType.XTERM);
        TWindow window = this.addWindow("title", 10, 0, 30, 30, TWindow.HIDEONCLOSE);
        window.addLabel("name", 1, 1);
        TField name = window.addField(8, 1, 20, true);

        window.addLabel("gender", 1, 3);
        List<String> list = new ArrayList<>();
        list.add("male");
        list.add("famale");
        TComboBox gender = window.addComboBox(8, 3, 20, list, 0, 1, new TAction() {
            @Override
            public void DO() {
            }
        });

        window.addLabel("age", 1, 5);
        TField age = window.addField(8, 5, 20, true);

        window.addLabel("skills", 1, 7);
        TCheckBox cpp = window.addCheckBox(1, 8, "c++", false);
        TCheckBox java = window.addCheckBox(1, 9, "java", false);

        TText log = window.addText("", 0, 14, 30, 10);

        window.addButton("submit", 8, 12, new TAction() {
            @Override
            public void DO() {
                log.setText(String.format("sumbitted! your info: name=%s, gender=%s, age=%s, skills=%s",
                        name.getText(), gender.getText(), age.getText(),
                        "" + (cpp.isChecked() ? "cpp" : "") + (java.isChecked() ? "java" : "")));
            }
        });

        name.activate();

        TMenu menu = this.addMenu("&menu");
        menu.addItem(1001, "open");
        menu.addItem(1002, "exit");
        this.mainWindow = window;
    }

    @Override
    protected boolean onMenu(TMenuEvent menu) {
        switch (menu.getId()) {
            case 1001:
                this.mainWindow.show();
                break;
            case 1002:
                this.exit();
            default:
                break;
        }
        return true;
    }

    public static void main(String[] args) throws Exception {
        JexerDemo app = new JexerDemo();
        app.run();
    }
}