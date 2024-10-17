---
title: js语法的awk
date: 2024-10-16 20:06:00
tags:
    - awk
    - cli
    - flat
    - rust
---
`awk`是一个非常强大的文本处理工具，我们在之前的文章中也介绍过，他的功能包括但不限于：
- 过滤文本
- 对逐行文本进行简单文本处理
- 对每一行按照指定符号拆分不同的列来处理
- 开始和结束的时候分别运行指定代码
- 甚至包含了`exec`每行执行shell

此外`awk`的性能也非常高，可以说是`awk`是没有缺点的，但是作为用户的我，是有缺点的，因为不是每天都在用`awk`指令，导致经常忘记`awk`中的函数的语法，比如文本拆分函数是哪个？文本替换函数？正则匹配怎么写？等等这些问题，在一段时间不用之后就会忘记，然后再去查笔记和`gpt`。

所以我就在想为什么`awk`的`{}`的语法不能用js的语法呢？js我很熟悉啊，对`string`处理的函数倒背如流，但是一想确实并非所有人都对js非常熟悉。那我不如自己写一个`awk`吧。

# 思路整理
`awk`的功能非常多，我觉得我的工具主要就是侧重于文本处理，对于其他的功能，我的工具都不做实现。按照`awk`的思想，他是对管道或者指定文件中的每一行文本逐行处理，需要做的是传入一个处理函数，该函数的返回值进行打印，所以大概是个js的`array.map()`函数的功能，但是考虑到希望实现过滤的功能，那么`array.flatMap()`好像更确切一些，所以我们这个工具就叫`flat`吧。

那么初步的计划就是这样：
```bash
$ cat app.log | flat 'l.split(" ")[0]'
# 从管道中读取并执行，与以下awk指令效果一致
$ cat app.log | awk  '{print $1}'

$ flat 'l.split(" ")[0]' app.log
# 从文件中读取并执行，自己用代码进行拆分，默认不执行拆分指令。与以下awk指令效果一致
$ awk  '{print $1}' app.log 
```

然后为了实现统计类型的编程，我们还需要`awk`中`BEGIN` `END`这样的函数指定，来执行初始化和收尾的工作，这里我希望用命令行参数指定的方式，这样感觉更规范一些。
```bash
# 这里实现的功能为统计当前文件的字符数量
$ flat --begin 'var wordCount = 0' --end 'wordCount' 'wordCount += l.length; null' app.log

# 等价于
$ awk 'BEGIN { wordCount = 0 }END { print wordCount }{wordCount += length($0)}' app.log
```

那大概功能就是这样了，指令格式为`flat [option] function [filepath]`，至少有一个`function`参数来对每一行文件执行的js代码，其中内置一些变量方便使用比如变量`l`就是当前行的字符串；`filepath`是可选的，如果有这个参数的话，就读取这个文件，如果没有这个参数的话，可以从管道中获取数据；`option`是可选的，目前想到需要提供的有`--begin -b`和`--end -e`两个来对齐`awk`的`BEGIN END`函数功能。其他的暂时不需要，以后有需求了再去定吧。

# 技术选型
我们想要用`js`的语法来运行函数，因为`js`的语法简单好记和`java`高度相似，如果有拿不准的还可以再浏览器console中测试验证。

既然函数语法是`js`，那么最简单的实现方式就是用`node` `deno` `bun`这种js运行时来实现，但是`bun`没有打包为独立运行的二进制文件的功能，`node`和`deno`的打包完的话都需要把核心的运行时打包到二进制文件中，导致最终的文件大小超过了`50M`，这对于这么简单的一个功能来说实在是有点大了。所以排除`js`运行时。当然`java` `python`等解释型的也都排除，因为不保证机器上有`runtime`都需要打一个臃肿的包。

最后剩下`c` `golang` `rust`，首先排除`c`，c语言实现这个项目代码量都要远超其他两个，剩下俩，`rust`性能好一些，我们暂时选择用`rust`实现，并且在`rust`中也找到了非常精炼的`js`运行时的库`quick-js`，然后`cli`需要的基础的规范，参数指定，`--help`等，通过`clap`这个库来完成。

# 开整
## 先实现clap读取参数的部分
创建项目：
```bash
$ cargo new flat
$ cd flat
$ cargo add clap
```

```rs
use std::fs::File;
use std::io::{self, BufRead, BufReader};
use quick_js::{Context, JsValue};
use clap::{Arg, Command};

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(Arg::new("begin")
            .short('b')
            .long("begin")
            .help("JavaScript code to execute before processing any lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("end")
            .short('e')
            .long("end")
            .help("JavaScript code to execute after processing all lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("function")
            .help("JavaScript code to process each line, l is the origin string")
            .required(true)
            .index(1))
        .arg(Arg::new("file")
            .help("Path to the input file. If not provided, reads from stdin.")
            .index(2))
        .get_matches();

    let begin_code = matches.get_one::<String>("begin");
    let end_code = matches.get_one::<String>("end");
    let js_function = matches.get_one::<String>("function").unwrap();
    let file_path = matches.get_one::<String>("file");

    if let Some(code) = begin_code {
        println!("begin_code: {}", code);
    }
    if let Some(code) = end_code {
        println!("end_code: {}", code);
    }
    println!("js_function: {}", js_function);
    if let Some(path) = file_path {
        println!("file_path: {}", path);
    }
}
```

测试：
```bash
$ cargo run -- -b 'bbb' -e 'eee' 'jsjsjs' file
begin_code: bbb
end_code: eee
js_function: jsjsjs
file_path: file

$ cargo run -- --begin 'bbb' 'jsjsjs' file
begin_code: bbb
js_function: jsjsjs
file_path: file

$ cargo run -- -h
Usage: flat [OPTIONS] <function> [file]

Arguments:
  <function>  JavaScript code to process each line, l is the origin string
  [file]      Path to the input file. If not provided, reads from stdin.

Options:
  -b, --begin <begin>  JavaScript code to execute before processing any lines
  -e, --end <end>      JavaScript code to execute after processing all lines
  -h, --help           Print help
  -V, --version        Print version
```

## 然后补全js代码执行的部分即可
安装依赖
```bash
$ cargo add quick-js
```
添加js代码上下文`Context::new().unwrap()`，借助其`eval`方法即可运行js代码了，我们把当前行拼接字符串赋值给变量`l`，即可完成相应的功能了。

为了方便使用我们还定义了空对象`ctx`，`n1 n2 n3`三个数字，空字符串`s`，空数组`arr`，这里没有像`awk`中那样用`print`函数才进行打印，而是`eval`返回的对象不是`null/undefined`时m默认打印出来，所以如果不想打印的话，代码块最后可以添加个`null`。
```rs
use std::fs::File;
use std::io::{self, BufRead, BufReader};
use quick_js::{Context, JsValue};
use clap::{Arg, Command};

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(Arg::new("begin")
            .short('b')
            .long("begin")
            .help("JavaScript code to execute before processing any lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("end")
            .short('e')
            .long("end")
            .help("JavaScript code to execute after processing all lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("function")
            .help("JavaScript code to process each line, l is the origin string")
            .required(true)
            .index(1))
        .arg(Arg::new("file")
            .help("Path to the input file. If not provided, reads from stdin.")
            .index(2))
        .get_matches();

    let begin_code = matches.get_one::<String>("begin");
    let end_code = matches.get_one::<String>("end");
    let js_function = matches.get_one::<String>("function").unwrap();
    let file_path = matches.get_one::<String>("file");

    // 创建JavaScript 执行上下文
    let context = Context::new().unwrap();
    
    // 创建全局变量
    let _ = context.eval("var ctx = {}, n1=0, n2=0, n3=0, s='', arr=[];");
    
    // 执行begin的代码块，如果有的话
    if let Some(code) = begin_code {
        if let Err(e) = context.eval(code) {
            eprintln!("Error executing BEGIN JS: {:?}", e);
        }
    }

    // 逐行读取文件或者管道内容
    let input: Box<dyn BufRead> = if let Some(path) = file_path {
        Box::new(BufReader::new(File::open(path).expect("Failed to open file")))
    } else {
        Box::new(io::stdin().lock())
    };

    for line in input.lines() {
        let line = line.unwrap();
        let func = format!("{{ var l='{}'; {} }}", line.replace("'", "\\'"), js_function);
        // 将每一行传递给 JavaScript 函数
        let result = context.eval(&func);
        // 处理执行结果
        match result {
            Ok(JsValue::String(s)) => println!("{}", s),
            Ok(JsValue::Int(s)) => println!("{}", s),
            Ok(JsValue::Bool(s)) => println!("{}", s),
            Ok(JsValue::Float(s)) => println!("{}", s),
            Ok(JsValue::Array(s)) => println!("{:?}", s),
            Ok(JsValue::Object(s)) => println!("{:?}", s),
            Ok(_) => (),
            Err(e) => eprintln!("Error executing JS: {:?}", e),
        }
    }

    // Execute end code if provided
    if let Some(code) = end_code {
        let result = context.eval(&code);
        // 处理执行结果
        match result {
            Ok(JsValue::String(s)) => println!("{}", s),
            Ok(JsValue::Int(s)) => println!("{}", s),
            Ok(JsValue::Bool(s)) => println!("{}", s),
            Ok(JsValue::Float(s)) => println!("{}", s),
            Ok(JsValue::Array(s)) => println!("{:?}", s),
            Ok(JsValue::Object(s)) => println!("{:?}", s),
            Ok(_) => (),
            Err(e) => eprintln!("Error executing JS: {:?}", e),
        }
    }
}
```
# 测试
求文件的字符数量，结果一致。
```bash
$ flat -b 'var sum = 0' 'sum += l.length; null' -e 'sum' test.txt
810915

$ awk 'BEGIN { sum = 0} {sum += length($0)} END {print sum}' test.txt
810915
```
虽然我们的这个实现是个“玩具”，但是还是找一个大文件，看一下和`awk`的性能差距，如下统计1亿多个字符的文件中一共有多少个字符，大概100多M，


在macM2上，`awk`只需要`2.58s`，而`flat`有`8.38s`满额了3倍以上，但是比想象中快一些，起码是同一个数量级的。

而在linux上，还是这个文件`awk`只需要`<1s`，而`flat`是`9s`,这个就差了10倍了。

我们可以思考下为什么我们的代码比`awk`慢了2倍，当然首先会想到，因为我们用了`quick-js`这个js运行时，他需要解释`js`代码来执行，肯定是比较慢的。而且每一行都需要解释，这肯定比`awk`这种纯的`native`程序慢。我们把`eval`删掉，只读取这文件耗时不到1s，所以有7s的时间都是用在了`context.eval`上面。

所以一种优化思路就是，每次`eval`执行不再拘泥于一行，例如凑够10行，拼一个jsFunction传入`context`去解释执行，这样就减少了解释器启动的次数，猜测可能有优化，但是估计优化幅度并不确定。

另外一个值得关注的是，我们采用了单线程的策略，读取文件=》执行函数=》再读下一行=》再执行，可以把读取和执行放到不同的线程中，但是实测效果并不明显。反而是文件快速读取完成都把数据堆在了`channel`中，占用了大量的内存，代码如下，并不建议这样修改。

```rs
use std::fs::File;
use std::io::{self, BufRead, BufReader};
use quick_js::{Context, JsValue};
use clap::{Arg, Command};
use std::thread;
use std::sync::mpsc;

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(Arg::new("begin")
            .short('b')
            .long("begin")
            .help("JavaScript code to execute before processing any lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("end")
            .short('e')
            .long("end")
            .help("JavaScript code to execute after processing all lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("function")
            .help("JavaScript code to process each line, l is the origin string")
            .required(true)
            .index(1))
        .arg(Arg::new("file")
            .help("Path to the input file. If not provided, reads from stdin.")
            .index(2))
        .get_matches();

    let begin_code = matches.get_one::<String>("begin").cloned();
    let end_code = matches.get_one::<String>("end").cloned();
    let js_function = matches.get_one::<String>("function").unwrap().clone();
    let file_path = matches.get_one::<String>("file").cloned();

    // 创建JavaScript 执行上下文
    let context = Context::new().unwrap();
    
    // 创建全局变量
    let _ = context.eval("var ctx = {}, n1=0, n2=0, n3=0, s='', arr=[];");
    
    // 执行begin的代码块，如果有的话
    if let Some(code) = &begin_code {
        if let Err(e) = context.eval(code) {
            eprintln!("Error executing BEGIN JS: {:?}", e);
        }
    }

    // 创建通道
    let (sender, receiver) = mpsc::channel();

    // 在新线程中读取文件
    let reader_thread = thread::spawn(move || {
        let input: Box<dyn BufRead> = if let Some(path) = file_path {
            Box::new(BufReader::new(File::open(path).expect("Failed to open file")))
        } else {
            Box::new(io::stdin().lock())
        };

        for line in input.lines() {
            if let Ok(line) = line {
                if sender.send(line).is_err() {
                    break;
                }
            }
        }
        // println!("send finish")
    });

    // 在主线程中处理每一行
    for line in receiver {
        let func = format!("{{ var l='{}'; {} }}", line.replace("'", "\\'"), js_function);
        // 将每一行传递给 JavaScript 函数
        let result = context.eval(&func);
        // 处理执行结果
        match result {
            Ok(JsValue::String(s)) => println!("{}", s),
            Ok(JsValue::Int(s)) => println!("{}", s),
            Ok(JsValue::Bool(s)) => println!("{}", s),
            Ok(JsValue::Float(s)) => println!("{}", s),
            Ok(JsValue::Array(s)) => println!("{:?}", s),
            Ok(JsValue::Object(s)) => println!("{:?}", s),
            Ok(_) => (),
            Err(e) => eprintln!("Error executing JS: {:?}", e),
        }
    }

    // 等待读取线程结束
    reader_thread.join().unwrap();

    // Execute end code if provided
    if let Some(code) = end_code {
        let result = context.eval(&code);
        // 处理执行结果
        match result {
            Ok(JsValue::String(s)) => println!("{}", s),
            Ok(JsValue::Int(s)) => println!("{}", s),
            Ok(JsValue::Bool(s)) => println!("{}", s),
            Ok(JsValue::Float(s)) => println!("{}", s),
            Ok(JsValue::Array(s)) => println!("{:?}", s),
            Ok(JsValue::Object(s)) => println!("{:?}", s),
            Ok(_) => (),
            Err(e) => eprintln!("Error executing JS: {:?}", e),
        }
    }
}
```
# 优化
因为`quick-js`是一个比较简单的实现，他的性能并不算高，但是很小巧，上面二进制文件的大小才1M左右。极限压缩可能也就几百K。如果换成`deno_core`这个`deno`的`js`运行时，的核心包。
```bash
$ cargo add deno_core
```
代码进行简单的替换：
```rs
use std::fs::File;
use std::io::{self, BufRead, BufReader};
use clap::{Arg, Command};
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(Arg::new("begin")
            .short('b')
            .long("begin")
            .help("JavaScript code to execute before processing any lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("end")
            .short('e')
            .long("end")
            .help("JavaScript code to execute after processing all lines")
            .value_parser(clap::builder::ValueParser::string()))
        .arg(Arg::new("function")
            .help("JavaScript code to process each line, l is the origin string")
            .required(true)
            .index(1))
        .arg(Arg::new("file")
            .help("Path to the input file. If not provided, reads from stdin.")
            .index(2))
        .get_matches();

    let begin_code = matches.get_one::<String>("begin");
    let end_code = matches.get_one::<String>("end").cloned();
    let js_function = matches.get_one::<String>("function").unwrap();
    let file_path = matches.get_one::<String>("file");

    // 创建JavaScript 执行上下文
    let mut runtime = JsRuntime::new(RuntimeOptions::default());

    // 创建全局变量
    runtime.execute_script("<anon>", "var ctx = {}, n1=0, n2=0, n3=0, s='', arr=[];").expect("Eval failed");
    // 执行begin的代码块，如果有的话
    if let Some(code) = begin_code {
        runtime.execute_script("<anon>", code.to_string()).expect("Eval failed");
    }

    // 逐行读取文件或者管道内容
    let input: Box<dyn BufRead> = if let Some(path) = file_path {
        Box::new(BufReader::new(File::open(path).expect("Failed to open file")))
    } else {
        Box::new(io::stdin().lock())
    };

    for line in input.lines() {
        let line = line.unwrap();
        let func = format!("{{ var l='{}'; {} }}", line.replace("'", "\\'"), js_function);
        // 将每一行传递给 JavaScript 函数
        runtime.execute_script("<anon>", func).expect("Eval failed");
    }

    // Execute end code if provided
    if let Some(code) = end_code {
        runtime.execute_script("<anon>", code).expect("Eval failed");
    }
}
```
此时的性能提高了2-3倍，计算1亿字符文件字符总数的测试中在gitpod的linux上耗时是`5s`，相比`awk`只有`0.5s`左右。差距在10倍左右。
```
$ time awk '{s+=length($0)} END {print s}' ../test.txt 
119204505

real    0m0.577s
user    0m0.540s
sys     0m0.036s
```
继续按照行数进行批次处理，如下每100行作为一个批次处理：
```rs
mod test;
use clap::{Arg, Command};
use deno_core::JsRuntime;
use deno_core::RuntimeOptions;
use std::fs::File;
use std::io::{self, BufRead, BufReader};

fn main() {
    // 定义参数形式为 flat [option] function [file]
    let matches = Command::new("Flat")
        .version("1.0")
        .author("Your Name <sunwu51@126.com>")
        .about("Processes lines of input with JavaScript")
        .arg(
            Arg::new("begin")
                .short('b')
                .long("begin")
                .help("JavaScript code to execute before processing any lines")
                .value_parser(clap::builder::ValueParser::string()),
        )
        .arg(
            Arg::new("end")
                .short('e')
                .long("end")
                .help("JavaScript code to execute after processing all lines")
                .value_parser(clap::builder::ValueParser::string()),
        )
        .arg(
            Arg::new("function")
                .help("JavaScript code to process each line, l is the origin string")
                .required(true)
                .index(1),
        )
        .arg(
            Arg::new("file")
                .help("Path to the input file. If not provided, reads from stdin.")
                .index(2),
        )
        .get_matches();

    let begin_code = matches.get_one::<String>("begin");
    let end_code = matches.get_one::<String>("end").cloned();
    let js_function = matches.get_one::<String>("function").unwrap();
    let file_path = matches.get_one::<String>("file");

    // 创建JavaScript 执行上下文
    let mut runtime = JsRuntime::new(RuntimeOptions::default());

    // 创建全局变量
    runtime
        .execute_script("<anon>", "var ctx = {}, n1=0, n2=0, n3=0, s='', arr=[];")
        .expect("Eval failed");
    // 执行begin的代码块，如果有的话
    if let Some(code) = begin_code {
        runtime
            .execute_script("<anon>", code.to_string())
            .expect("Eval failed");
    }

    // 逐行读取文件或者管道内容
    let input: Box<dyn BufRead> = if let Some(path) = file_path {
        Box::new(BufReader::new(
            File::open(path).expect("Failed to open file"),
        ))
    } else {
        Box::new(io::stdin().lock())
    };
    let mut vec = vec![];
    for line in input.lines() {
        let line = line.unwrap();
        let line = line.replace("'", "\\'");
        vec.push(line.to_string());
        // 先扔到数组里，每200行，处理一次
        if vec.len() == 200 {
            eval(&mut vec, &mut runtime, &js_function);
        }
    }
    if !vec.is_empty() {
        eval(&mut vec, &mut runtime, &js_function);
    }
    // Execute end code if provided
    if let Some(code) = end_code {
        runtime.execute_script("<anon>", code).expect("Eval failed");
    }
}

fn eval(vec: &mut Vec<String>, runtime: &mut JsRuntime, js_function: &str) {
    let mut func = "var ls = [".to_string();
    for ele in vec.iter() {
        func.push_str("'");
        func.push_str(ele);
        func.push_str("', ")
    }
    func.push_str("];");
    vec.clear();

    func.push_str(&format!("ls.forEach(l=>{{ {} }})", js_function));
    let func = format!("{{ {} }}", func);
    runtime.execute_script("<anon>", func).expect("Eval failed");
}
```
同样还是1亿字符文件计数的任务，耗时来到了2s，性能提高了一倍，此时对比`awk`的`0.5s`，差距在4倍，可以说是非常不错了，因为这里使用的是js语法，js解释器运行。
```bash
$ time flat 'n1+=l.length' -e 'console.log(n1)' ../test.txt 
119204505

real    0m2.114s
user    0m2.117s
sys     0m0.394s
```
因为计数的任务比较简单，我们可以在测试一个负责场景，按照数字0将每一行进行拆分，然后把第0个元素取出，过滤出英文字母的个数，进行求和。

![compare](https://i.imgur.com/tn7sMYE.png)

这个复杂场景对比可以看出我们的`flat`工具性能反而更好，我猜测与正则的运行逻辑不一致有关，但是不管怎么说，复杂语句上的性能，是会和`awk`逼近的。

# 可执行文件压缩
但是使用`deno_core`会把一个v8引擎塞到二进制文件导致文件从`1M`突增到`41M`，这里我们对二进制文件进行压缩。

配置编译优化，拉满，实际测试配不配没太大区别。
```yaml: Cargo.toml
...
[profile.release]
opt-level = 'z'
lto = true
debug = false
panic = "abort"
codegen-units = 1
...
```

构建二进制文件，并用`strip`去掉二进制文件中的头部信息，这一步有一些帮助。
```bash
$ cargo b -r
$ strip target/release/flat
```

用`upx`压缩二进制文件，这个工具用套壳压缩的方式可以大大减小文件大小，如下直接从41变14M了。运行时会自动解压。
```bash
$ apt install upx
$ upx  --best target/release/flat
                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2020
UPX 3.96        Markus Oberhumer, Laszlo Molnar & John Reiser   Jan 23rd 2020

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
  42491288 ->  14527856   34.19%   linux/amd64   flat        
```

后续我单独创建一个`repo`把这个工具发布出来。