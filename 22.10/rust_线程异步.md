# 线程
thread位于`std::thread`包，`thread::spawn(Fn)`来创建并执行一个线程。`thread::sleep(dur)`来sleep。
```rs
thread::spawn(move ||println!("123"));
thread::sleep(std::Duration::from_secs(1));
```
move关键字，因为线程的闭包经常用到当前上下文变量，并且必须持有所有权，因为线程可能比main线程存活更久，所以move就是经常见到的。
# 通道
rust中线程数据交互与java不同，java是通过简单的共享内存，而rust一般通过channel。`use std::sync::mpsc;`

channel方法返回一个元组，分别有`Sender<T>` 和 `Receiver<T>`两个元素。T则是后面第一次发送数据的时候推断出来的类型，且类型不能变。一般在主线程声明channel，然后move到子线程中，但是只能move到一个线程中，所以在线程创建之前一般需要clone下tx、rx再move到线程中，进行发送和接受即可。Send有返回值Result，即可能没有接受者，此时会返回一个Err，可以判断并进行处理。recv一样，他会在所有发送者都关闭的时候收到一个报错，毕竟没有发送者，等于白等。

send会把所有权send出去，这也就是只能单个接收者的原因，因为变量所有权只能有一个。
```rs
use std::sync::mpsc;
use std::thread;

fn main() {
    // 创建一个消息通道, 返回一个元组：(发送者，接收者)
    let (tx, rx) = mpsc::channel();

    // 创建线程，并发送消息
    thread::spawn(move || {
        // 发送一个数字1, send方法返回Result<T,E>，通过unwrap进行快速错误处理
        tx.send(1).unwrap();

        // 下面代码将报错，因为编译器自动推导出通道传递的值是i32类型，那么Option<i32>类型将产生不匹配错误
        // tx.send(Some(1)).unwrap()
    });

    // 在主线程中接收子线程发送的消息并输出
    println!("receive {}", rx.recv().unwrap());
}
```
多个tx发送的消息，在rx看来可能是无序的，因为无法预测线程的执行顺序，但是同一个线程多次send的数据一定是有序的队列。

上面是异步通道还有个同步的通道，就是send之后需要被recv才会继续往下，否则就阻塞。他们的创建代码如下，异步返回的是Sneder，而同步返回SyncSender，同步有个参数0，是指队列大小，0即不存，完全同步阻塞，如果是10，则前10条发送是非阻塞的，放到了同步队列，后面的消息会等待。

异步通道就是同步通道的队列长度无限大的版本，但是大项目存在风险，所以有特定大小队列的同步通道也很常用。
```rs
// 常用的异步channel
let (tx, rx) = mpsc::channel();
// 同步channel
let (tx, rx)= mpsc::sync_channel(0);
```

tx一般通过clone之后放到子线程中执行，但这会导致一共10个子线程，tx会有11个，而通道关闭的条件是所有tx被drop或所有rx被drop(rx只有一个，在那可劲接受)，根tx一直没有被drop就导致通道一直不会关闭，所以经常会用到`drop(tx)`来解决亚当tx。

通过for语句无限接受，until每个tx被干掉。x是T类型。当通道关闭，for循环自动结束，不会panic。
```rs
for x in recv {
  println!("Got: {}", x);
}
```
# 锁
互斥锁`Mutex`与读写锁`RwLock`

Mutex本质是智能指针，使用有点像Box，只不过Mutex同时只能被一个线程拿到里面的数据，其他拿数据的线程被阻塞。使用如下，与mpsr不同，mpsr是可以clone多个tx的，Mutex没有mp的语意，就是他自己，需要被多个线程来持有所有权，于是需要借助`Arc`（Rc是单线程的需要用Arc）。lock方法拿到锁或阻塞，拿到之后返回的num是`MutexGuard`类型是智能指针，通过`*num`自动解引用到原始的数据0，智能指针的drop是还锁，下面代码中num的scope到闭包的`}`结束截止，此时归还锁，使下一个线程可以使用。如果想实现同步代码块，可以添加`{}`来框定锁的作用域，就可以在作用域结束drop锁了。
```rs
use std::sync::Mutex;

let counter = Arc::new(Mutex::new(0));
for _ in 0..10 {
  let counter = Arc::clone(&counter);
  let handle = thread::spawn(move || {
    let mut num = counter.lock().unwrap();
    *num += 1;
});
```
上面代码中，`Arc<Mutex<T>>`实际上提供了，多线程场景下，多个所有权同步读写内部数据的场景，并没有mut修饰，因为Metex与RefCell一样都是动态的可变性。相当于单线程场景下的`Rc<RefCell<T>>`。

读写锁的代码如下，与Mutex类似通过new来创建，只不过通过`read()/write()`方法分别尝试获取读/写锁，读不互斥，写和读写互斥。
```rs
use std::sync::RwLock;

fn main() {
    let lock = RwLock::new(5);

    // 同一时间允许多个读
    {
        let r1 = lock.read().unwrap();
        let r2 = lock.read().unwrap();
        assert_eq!(*r1, 5);
        assert_eq!(*r2, 5);
    } // 读锁在此处被drop

    // 同一时间只允许一个写
    {
        let mut w = lock.write().unwrap();
        *w += 1;
        assert_eq!(*w, 6);

        // 以下代码会panic，因为读和写不允许同时存在
        // 写锁w直到该语句块结束才被释放，因此下面的读锁依然处于`w`的作用域中
        // let r1 = lock.read();
        // println!("{:?}",r1);
    }// 写锁在此处被drop
}
```
# Send与Sync
这是俩特征，与线程间数据传递有关。
- 实现Send的类型可以在线程间安全的传递其所有权
- 实现Sync的类型可以在线程间安全的共享(通过引用)
- 若类型`T`的引用`&T`是`Send`，则`T`是`Sync`。

几乎所有类型都默认实现了Send和Sync，实现了他们的类型组合出来的复合类型也默认实现。没实现的主要有`Cell/RefCell`是单线程版本没有实现`Sync`，`Rc`两者都没有实现。
# 全局变量
const可以在全局（不在某个函数里）声明全局的常量，static可以声明变量。但是这样的声明在使用的时候需要用unsafe代码块，这是因为声明一个普通变量，无法保证线程的安全性。unsafe代码块是说自己知道可能会有错，但是当前场景，自己不管错误，或者心里有数不会有错。
```rs
const A: i32 = 1;
static mut REQUEST_RECV: i32 = 1;
fn main() {
   unsafe {
        REQUEST_RECV += 1;
        assert_eq!(REQUEST_RECV, 1);
   }
}
```
如果要进行简单的记录可以考虑使用`Atomic`全局变量就不用unsafe代码，如下：
```rs
use std::sync::atomic::{AtomicUsize, Ordering};
static REQUEST_RECV: AtomicUsize  = AtomicUsize::new(0);
fn main() {
    for _ in 0..100 {
        REQUEST_RECV.fetch_add(1, Ordering::Relaxed);
    }

    println!("当前用户请求数{:?}",REQUEST_RECV);
}
```
# async与await
引入依赖
```rs
[dependencies]
futures = "0.3"
```
直接在函数上添加async标注，效果有点像spring的@Async，会把函数变成异步的，立即返回一个`Future<Output=T>`，block_on则是等待future执行完毕。
```rs
use futures::executor::block_on;

async fn hello_world() {
    println!("hello, world!");
}

fn main() {
    let future = hello_world(); // 返回一个Future, 因此不会打印任何输出
    block_on(future); // 执行`Future`并等待其运行完成，此时"hello, world!"会被打印输出
}
```
默认main函数上不能加`async`，而只有async函数里可以用`future.await`语法糖，所以我们多嵌套一层看个await的demo，await效果上是阻塞，但是实际上是当前线程可以用作其他任务了，直到异步有返回。例如我们可以通过`futures::join!(f1, f2);`来使用当前线程去执行多个future，当一个await之后，另一个会继续，达到IO多路复用的效果。当然join也只能在async函数使用。
```rs
use futures::executor::block_on;

async fn hello_world() -> u32 {
    println!("hello, world!");
    1
}
async fn call_another() {
    let one = hello_world().await;
    println!("{}", one);
}
fn main() {
    let future = call_another();
    block_on(future);
}
```

async还可以用于异步代码块，相当于声明了一个异步表达式，表达式返回值也是future，且一定注意表达式`}`结束后借个分号。下面代码展示了该表达式捕获了上下文中的i变量。实际上i捕获并没有拿到所有权
```rs
fn main() {
    let i = String::from("world");
    let f = async {
      println!("hello {}", i);
    };
    block_on(f);
    println!("hello {}", i);
}
```
如果想要拿到变量的所有权，在一些场景下我们的async代码块执行的时候，上下文的变量可能已经被drop了，所以需要直接把所有权交进来。使用`async move`来修饰代码块即可。
```rs
fn main() {
    let i = String::from("world");
    let f = async move{
      println!("hello {}", i);
    };
    block_on(f);
    println!("hello {}", i);// i已经move走了，此时报错
}
```
async代码块中使用`await?`，代码块的返回值是Future<自动推断>，而我们在异步代码块中经常调用返回值是`Result`的异步函数，例如一些库`reqwest`等都是定义返回值为`Result`类型，此时我们希望使用`await?`来简单的处理。但是因为表达式自动推断返回类型是`Result<T,E>`，但我们的正常业务逻辑只返回Ok的值，Err的并没有处理，如下，此时无法推断E的类型，报错。
```rs
async fn foo() -> Result<u8, String> {
    Ok(1)
}
async fn bar() -> Result<u8, String> {
    Ok(1)
}
pub fn main() {
    let fut = async {
        foo().await?;
        bar().await?;
        Ok(())
    };
}
```
这就需要在Ok，显示的指明类型，当然这也需要中间的await处的Err类型都是String类型才行。
```rs
let fut = async {
    foo().await?;
    bar().await?;
    Ok::<(), String>(()) // 在这一行进行显式的类型注释
};
```
# tokio与reqwest
tokio是第三方的async的库，非常强大，reqwest是基于tokio写的一个httpclient库，我们通过使用reqwest来学习tokio的使用姿势和基础的知识。引入他们的依赖
```rs
[dependencies]
reqwest = { version = "0.11.11", features = ["json", "cookies"] }
tokio = { version = "1", features = ["full"] }
```
tokio给我们提供了一个宏`#[tokio::main]`可以加在main函数上面，这样main就可以添加async标注了，本质是派生了一些代码，简化用户代码。
```rs
#[tokio::main]
async fn main() {
   let data = request_data().await.unwrap();
   println!("{:?}", data);
}
```
然后接下来来写request_data这个函数，注意这里用了特征对象`Box<dyn Error>`来表示各种错误类型，使得我们可以随意使用`await?`,因为reqwest（大多数库）的自定义Error类型也实现了`std::error::Error`。
```rs
use std::collections::HashMap;
use std::error::Error;

async fn request_data() -> Result<String, Box<dyn Error>> {
    // 准备请求参数, url
    let mut map = HashMap::new();
    map.insert("a", "1");

    const url = "https://www.baidu.com";

    let client = reqwest::Client::builder().build().unwrap();

    let res = client.post(url).json(&map).send().await?
        .text().await?;
    Ok(res)
  }
```
当然如果不想每次运行函数都要new一个client和声明一个url可以定义为全局变量，如下，对于复杂的client必须要用Option类型，相当于是个缓存。不用option，会报错，因为static只允许常量和常量函数表达式，builder().build()并不符合条件。
```rs
const URL: &str = "https://www.baidu.com";
static mut CLIENT: Option<reqwest::Client> = None;

async fn request_data() -> Result<String, Box<dyn Error>> {
    let client;
    unsafe {
        client = CLIENT.get_or_insert(reqwest::Client::builder().build().unwrap());
    }
//....
```
或者使用第三方`lazy_static`，引入`lazy_static = "1.4.0"`，然后声明全局变量client，会在client第一次被使用的时候执行，并创建该变量。
```rs
use lazy_static::lazy_static;

lazy_static! {
    static ref client: reqwest::Client = reqwest::Client::builder().build().unwrap();
}
```