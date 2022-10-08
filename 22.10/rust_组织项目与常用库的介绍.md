# 一、项目（pakage）包（crate）和模块（module）
cargo new出来的项目就是一个package，一个package下面可以放多个二进制包crate和一个库包lib，而每个包中又可以含有多个模块。

![image](https://i.imgur.com/36lwDS4.png)

以我们最简单的`cargo new webapp`为例，默认会创建二进制包的项目，目录结构如下，toml文件类似pom.xml记录了依赖的其他crate，而`src/main.rs`是二进制crate的入口，里面的main函数是整个项目的入口函数，这也是之前学习基础知识的项目结构。

![image](https://i.imgur.com/ATlrvIt.png)

## 拆分模块的几种方式
只有一个main.rs显然不行，因为我们需要把功能进行拆分，放到不同的文件或者目录下面，而非全部塞到main中。所以就有了mod。mod本身就是个关键字，我们可以在main函数中就地声明mod，mod中可以像正常一样的去声明结构体，函数等数据，也可以嵌套mod。只不过mod中的数据需要是pub修饰才能被其他文件访问。
```rs
// mod名字需要是驼峰
mod a {
    fn hi(){println!("hi a");}
    pub fn hello(){println!("hello a");}
    mod b {
      fn hi(){println!("hi b");}
      pub fn hello(){println!("hello b");}
    }
    pub mod c {
      fn hi(){println!("hi c");}
      pub fn hello(){println!("hello c");}
    }
    
}
fn main() {
    // main中只能访问pub的a::hello和a::c::hello，要c和hello都是pub
    // a不需要pub，因为他就是当前文件可见的
    a::hello();
    a::c::hello();
}
```
## 1 main.rs中声明mod
将mod移到专门的文件/文件夹中，`src/main.rs`是二进制包入口文件，同目录下的其他rs文件同样也会参与到编译中来，最简单的分离代码方式就是在`main.rs`中声明mod，但不写mod内容，直接分号结尾，`mod a;`，然后在同名的rs文件中写具体的内容，将上面代码进行稍微改动拆分成俩文件，如下。

![image](https://i.imgur.com/Kox0T71.png)
```rs
// src/main.rs
mod a;

fn main() {
    a::hello();
}
```
`mod a;`声明了`a.rs`里的内容都作为`mod a`里的内容，同时将a模块引入到当前文件，所以不需要在写一遍`use crate::a;`而如果想特定的引入a中的某些元素，则可以追加一行`use crate::a::hello;`。
```rs
// src/a.rs
pub fn hello(){println!("hello a");}
```
## 2 单独的目录
创建目录可以更好的组织文件，mod也可以放到一个目录下面管理，其实文件和文件夹在rust中都是mod，只不过文件默认就是引入自己，文件夹默认会找文件夹下mod.rs文件。

创建mod1目录，并在main中声明引入mod1：`mod mod1;`，此时mod1中内容被引入到main，而mod1是个目录，如果是目录的话只能引入该目录下`mod.rs`，而这个文件是引入当前目录的`a.rs`和`b.rs`作为包a和b。于是我们在main中通过`mod1::a::hello`调用。

![image](https://i.imgur.com/qf6SLeA.png)

如果我们想在一个mod中调用另一个mod的元素，可以通过`use crate::xxxx`引入另一个mod的内容，例如上面的b.rs可以引入a.rs中的函数。
```rs
// src/mod1/b.rs
use crate::mod1::a;

pub fn hello(){println!("hello b");}
pub fn hello_a(){
    a::hello();    
}
```
## a.rs与a/mod.rs
上面说了，引入`mod mod1;`，会找当前目录下`mod1.rs`或者`mod1/mod.rs`，我们可以使用`mod1.rs`和`mod1/a.rs`来实现上面同样的效果，只不过有点怪。此外如果两者同时存在，并不会报错，我看到的效果是`mod1/mod.rs`生效。

# 二、常用库的介绍
## 1 serde与serde_json
```
serde = { version = "1", features = ["derive"] }
serde_json = "1.0"
```
序列化的支持库serde提供了序列化的trait，具体的实现则需要自己实现，或者引入其他库，例如json的序列化实现`serde_json`。
```rs
#[macro_use]
extern crate serde; // 这两行代码作用：serde中声明的宏，在当前文件直接使用，不用加前缀

fn main() {
    #[derive(Debug, Serialize, Deserialize)]
    struct User {
        #[serde(rename="uid")]
        id: u32,
        name: String,
        is_male: bool,
    }

    // 下面是基本的json序列化与反序列化，注意反序列化User类型必须显示写，不然不知道要反成哪个类型。
    let u = User{id:1, name: "liming".into(), is_male: false};
    let str = serde_json::to_string(&u).unwrap();
    println!("{}", str);//{"uid":1,"name":"liming","is_male":false}
    let u2: User = serde_json::from_str(&str).unwrap();
    println!("{:?}", u2);
}
```
注意，反序列化可能会遇到json字段值为null的情况，在rust中没有null，对应的策略是，该字段类型需要是`Option<xx>`类型。有时候json结构负责我们想从中抽出某个值，这时候就有非常方便的`Value`类型，他有点像fastjson中的JsonObject。
```rs
// json!宏可以快速将一个json结构体，转为Value类型。上面的from_str，我们也可以显示的声明为Value类型。
    let v: Value = json!({"a": {"b": [{"c":1}, {"c":2}]}}); // 这里面可以用null， null是serde_json中的
    // println!("{:#?}", v);
    println!("{}", v["a"]["b"][1]["c"]); // 2 // 如果没有，比如b改为dcfdsafdsaf，返回null
```
`r#"xxx"#`原生字符串，xxx是不用转义的字符串，例如`"`等直接写即可，此外该语法可以支持多行文本非常方便。
```rs
let v: Value = serde_json::from_str(r#"
  {
    "txt": "12345"
  }
"#);
```
## 2 mysql与rbatis
mysql是最常用的数据库，虽然国外sqlite和postgresql也很常用，但是目前国内形势还是mysql最常用。

##
一个web项目demo
使用[warp](https://docs.rs/warp/latest/warp/index.html)、[rbatis](https://github.com/rbatis/rbatis)等常用库。
```
warp = "0.3.3"
rbatis = { version = "4.0"}
rbdc-mysql={version="0.1"}

rbs = { version = "0.1"}
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
```
