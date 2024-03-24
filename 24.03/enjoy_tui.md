# tui
最近因为想要给java的ByteSwapper工具加一个命令行的功能，来避免ip无法直连导致无法打开页面正常使用的问题。因而需要调研一些`tui`的库。

`tui`就是文字组成的ui，用字符串在控制台布局ui的形式，相比于图形化页面来说，功能比较原始，但是对于服务器系统来说，还是很有用的。比如我们在linux上常用的一些指令就有布局`tui`，像ps、top等，也有后来做的比较炫酷的像btm如下。

![gif](demo.gif)

`tui`的实现方式有很多，最简单的就是使用console相关的sdk，指定控制台的大小，然后在控制台上输出字符串，这种方式可以实现一些简单的功能，但是对于复杂的布局，还是不太方便。所以需要一些库的封装。

python的`curses`库，可以实现简单的对话窗口，较少的部件功能，但是对于一些简单的对话和选择场景是够用的。效果如下。

[![asciicast](https://asciinema.org/a/45946.svg)](https://asciinema.org/a/45946)

但是byteswapper需要的窗口更加复杂一些，可能类似上面的btm的tui，是需要子窗口。大概的功能是需要有两个子窗口，其中一个用来监听websocket服务是否有新的消息发送回来，并进行格式化的打印。而另一个窗口是一个交互式命令行，用来输入指令，转换后发到websocket服务端。

于是我调研了以下几个lib。

# 1 java的jexer
大约有1年没有更新了，一个基于java的tui工具库，目前维护在gitlab上，[地址](https://gitlab.com/AutumnMeowMeow/jexer)。

创建maven项目引入依赖
```xml
<dependency>
  <groupId>com.gitlab.klamonte</groupId>
  <artifactId>jexer</artifactId>
  <version>1.6.0</version>
</dependency>
```

最简单的项目的代码如下
```java
import jexer.TApplication;

// 1 创建一个继承TApplication的类，然后new出来运行run方法就有界面了
public class MyApplication extends TApplication {

    public MyApplication() throws Exception {
        super(BackendType.XTERM);

        // 2 可以添加一些预定义好的menu
        addToolMenu();
        addFileMenu();
        addWindowMenu();
    }

    public static void main(String [] args) throws Exception {
        MyApplication app = new MyApplication();
        app.run();
    }
}
```
效果如下，这几个menu有一些内置的功能例如浏览文件，打开图片等。

![image](https://i.imgur.com/F8yoFej.png)

在jexer中有几个比较基础的概念我们先理清楚：
- `menu`:   左上角的菜单栏，可以触发menu的选中行为来处理触发逻辑。
- `window`: 在下面的画布中会展示创建的window，可以创建多个。
- window中可以添加的有：`field`输入框，`label`只读文字，`button`按钮，`checkbox`选择器，`list`也是一个列表选择一个元素，等等。这里不一一列举，大多数常用组件都可以从他的文档中找到。

接下来我们来说一下这几个东西如何使用，注意在jexer中x，y，width，height的单位不是像素而是一个字的大小，例如下面宽高都是30，但是并不会绘制正方形，因为宽度是容30个字，高度是30行，30行有行距所以比30的宽要长。
```java
public class MyApplication extends TApplication {
    public MyApplication() throws Exception {
        super(BackendType.XTERM);
        // window的参数依次是标题，x，y，width，height，和flag
        // 这里HIDEENCONSLE是点击关闭后不销毁窗口，而是hide隐藏。
        this.addWindow("title", 10, 0, 30, 30, TWindow.HIDEONCLOSE);
    }

    public static void main(String [] args) throws Exception {
        MyApplication app = new MyApplication();
        app.run();
    }
}
```

![image](https://i.imgur.com/JiNdJr0.png)

上面我们绘制了一个窗口，如有需要我们可以多次addWindow来绘制多个窗口，通过xy坐标给他们错开。当然如果出现重叠的部分也没关系，可以通过拖拽title部分将其分离。
```java
...
    this.addWindow("title1", 10, 0, 30, 30, TWindow.HIDEONCLOSE);
    this.addWindow("title2", 20, 10, 30, 30, TWindow.HIDEONCLOSE);
...
```
![image](https://i.imgur.com/OMZvBP6.gif)

接下来我们在window中放置一些填写表单的控件，例如文本框，选择框，提交按钮。

```java
...
        TWindow window = this.addWindow("title", 10, 0, 30, 30, TWindow.HIDEONCLOSE);

        // 在第1,1位置添加name文本，占1,1 -> 1,5的坐标
        window.addLabel("name", 1, 1);
        // 在8,1处放置一个长度为20的输入框，离前面label3个字的距离，
        TField name = window.addField(8, 1, 20, true);

        // 在1,3位置放置gender文本，然后在右边放置combox性别二选一
        window.addLabel("gender", 1, 3);
        List<String> list = new ArrayList<>();
        list.add("male");
        list.add("famale");
        TComboBox gender = window.addComboBox(8, 3, 20, list, 0, 1);

        // 在第1,5位置放置age文本，并在右侧放置文本输入框。
        window.addLabel("age", 1, 5);
        TField age = window.addField(8, 5, 20, true);

        // 第7行放置skills并在第8、9行放置两个技能checkbox
        window.addLabel("skills", 1, 7);
        TCheckBox cpp = window.addCheckBox(1, 8, "c++", false);
        TCheckBox java = window.addCheckBox(1, 9, "java", false);

        // 在最后面放置日志Text，提交后这个text打印提交内容
        TText log = window.addText("", 0, 14, 30, 10);
        // 在表达后面添加提交按钮，提交后触发打印
        window.addButton("submit", 8, 12, new TAction() {
            @Override
            public void DO() {
                log.setText(String.format("sumbitted! your info: name=%s, gender=%s, age=%s, skills=%s",
                        name.getText(), gender.getText(), age.getText(),
                        "" + (cpp.isChecked() ? "cpp" : "") + (java.isChecked() ? "java" : "")));
            }
        });

        // 焦点设置到第一个输入框
        name.activate();
...
```

![image](https://i.imgur.com/ErgVNO2.gif)

上面例子给出了表单的基本填写和提交，提交部分仅用打印日志来展示了，实际改为触发所需的后台行为即可。

最后我们来说一下`menu`，menu大多数情况下是用来处理一些全局的操作，比如打开关闭窗口，退出程序等，我们可以在上一段程序中简单改造全部代码如下，这样给与了menu重新打开window和退出tui的能力。

```java
public class Test extends TApplication {
    TWindow mainWindow;

    public Test() throws Exception {
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

        TMenu menu = this.addMenu("menu");
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
        Test app = new Test();
        app.run();
    }
}
```
![image](https://i.imgur.com/V7aLw47.gif)

小细节，上面图中能看到鼠标悬浮menu的时候有字幕串位置的情况可以通过设置的字符串前面加个`&`来避免
```java
TMenu menu = this.addMenu("&menu");
```

小结：

优点是确实绘制了一个窗口化的tui页面，能完成基本的表达的提交等任务，用法也很简单，对java开发者比较友好。

缺点是java的库，所以本身运行依赖java环境，对非javaer非常不友好，无法native运行，体积也较大；页面样式比较老，非常有年代感，不够现代化；依赖`/bin/sh`，对windows不友好，无法跨平台；提供的控件样式几乎不能修改。

# 2 rust的Ratatui
在最开始介绍的buttom(btm)就是通过这个库的前身`tui-rs`(已经不维护)写的。从一个简单的`hello`程序来了解`ratatui`的组织形式，如下，主要就是三步，其中第一步和第二步都是准备工作和退出的工作，所以关键就是中间的`loop`部分，后面我们着重来说`loop`部分怎么写。
```rust
use crossterm::{
    event::{self, KeyCode, KeyEventKind},
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
    ExecutableCommand,
};
use ratatui::{
    prelude::{CrosstermBackend, Stylize, Terminal},
    style::Color,
    widgets::{Block, Borders, Paragraph},
};
use std::io::{stdout, Result};

fn main() -> Result<()> {
    // 第一部分：“擦黑板”，准备工作就是将终端的内容替换成一块新的屏幕，并清理屏幕
    stdout().execute(EnterAlternateScreen)?;
    // raw_mode就是中端进入空白模式，输入输出键盘等指令全都不好使
    enable_raw_mode()?;
    let mut terminal = Terminal::new(CrosstermBackend::new(stdout()))?;
    terminal.clear()?;

    // 第二部分：“黑板写字”，在黑板上写东西，注意是个死循环，使用的是每一帧都全量刷新的模式
    loop {
        terminal.draw(|frame| {
            let area = frame.size();
            frame.render_widget(
                Paragraph::new("Hello Ratatui! (press 'q' to quit)")
                    .bg(Color::Yellow)
                    .fg(Color::LightRed)
                    .block(Block::default().blue().borders(Borders::ALL)),
                area,
            );
        })?;

        if event::poll(std::time::Duration::from_millis(16))? {
            if let event::Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press && key.code == KeyCode::Char('q') {
                    break;
                }
            }
        }
    }

    // 第三部分：“擦黑板退出到原来”
    stdout().execute(LeaveAlternateScreen)?;
    disable_raw_mode()?;
    Ok(())
}
```

![image](https://i.imgur.com/6Flovbs.png)

`loop`部分主要有两个步骤:
- 1 `terminal.draw`widget
- 2 `event`事件监听，触发后台逻辑和widget的一些变化。

## 2.1 terminal.draw
`draw`函数接一个闭包，参数是`Frame`，即当前这一帧，可以在这一帧上画一些`widget`，使用`frame.render_widget`方法，这个方法有俩参数，`W`和`Rect`，其中前者是控件，后者就是画在哪个区域。
```rust
pub fn render_widget<W: Widget>(&mut self, widget: W, area: Rect)
```
先来说`Rect`是指定一个矩形的区域，上面hello代码中直接使用`frame.size()`即当前整个画布。我们也可以自定一个区域。
```rust
// Rect::new(x, y, width, height)
let area = Rect::new(0,0,100,100); // 指定一个100x100的区域，左上角是顶格

// 一个已知的area可以通过x y width height left() top()..等获取各项数值。
// 例如位于屏幕中央长宽各一半的写法如下图
let area = frame.size();
let area = Rect::new(
    area.width / 4,
    area.height / 4,
    area.width / 2,
    area.height / 2,
);
```
![image](https://i.imgur.com/ZYWvOlU.png)

`area`通过四个点的坐标指定当前的位置，但是对于一些类似bottom这种工具的布局来说写起来有点费劲，所以提供了好用的`layout`工具，`Layout`本质是一种布局规则，最终通过`split`方法作用于一个`area`就可以将其切分成多块。

```rust
// 先横向按照5:5分左右两区域
let hareas = Layout::new(
    ratatui::layout::Direction::Horizontal,
    vec![Constraint::Percentage(50), Constraint::Percentage(50)],
)
.split(frame.size());

// 对左侧再上下5:5分上下区域
let left_areas = Layout::new(
    ratatui::layout::Direction::Vertical,
    vec![Constraint::Percentage(50), Constraint::Percentage(50)],
)
.split(hareas[0]);

// 对右侧再上下5:5分上下区域
let right_areas = Layout::new(
    ratatui::layout::Direction::Vertical,
    vec![Constraint::Percentage(50), Constraint::Percentage(50)],
)
.split(hareas[1]);


// 这样就分了四个象限，可以分别去draw东西

frame.render_widget(
    some_widget,
    left_areas[0],
);

frame.render_widget(
    some_widget,
    left_areas[1],
);

frame.render_widget(
    some_widget,
    right_areas[0],
);

frame.render_widget(
    some_widget,
    right_areas[1],
);
```
内置控件widget，可以参考[官方文档](https://ratatui.rs/showcase/widgets/)，还有一些优秀的[第三方控件](https://ratatui.rs/showcase/third-party-widgets/).

组件基本都实现了`Stylize`接口，有以下几个常用的函数
- bg(Color) 修改背景色
- fg(Color) 修改前景色(文字颜色)
- block(Block) 修改边框Block本来就是个Widget，类似html中div

这里挑几个介绍下。

- Paragraph,
```rust
frame.render_widget(
    Paragraph::new("Hello Ratatui! (press 'q' to quit)")
        .bg(Color::Yellow)
        .fg(Color::LightRed)
        .block(Block::default().blue().borders(Borders::ALL)),
    frame.size(),
);
```