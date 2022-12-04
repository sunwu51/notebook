# io密集场景测试
今天对于一个大量io的场景进行一个测试，来看不同的原理下的执行效率。

场景：调用`https://jsonplaceholder.typicode.com/comments`这个接口1w次，并把得到的数据存储到文件中。

这个场景中有两阶段的IO，一个是请求http接口，一个是写文件（文件最终有1.5G大小）。下面结果单位是秒

# 1 使用java
单线程串行执行的时间：500+s 去掉写文件部分：23

100个线程执行的时间： 50s 去掉写文件部分：5s

200个线程执行时间：  39s

500个线程执行时间：  85s 性能出现下降

mono执行出错，报错信息是netty的队列长度超过了1000，如果把1w个任务改成1k个执行时间是： 7s，依次类推1w个就是10倍，也就是70s左右，去掉写文件部分40s

# 2 使用nodejs
nodejs虽然是单线程，但是底层使用eventpool和epoll所以对于io场景具有天然的优势。

nodejs执行时间： 150+ 去掉写文件部分 99s
# 3 使用rust reqwest
reqwest使用了tokio本质是协程，应该能和golang执行效率差不多。

执行时间：404s worker线程调到100还是400s+ 怀疑是Future只有等到await的时候才执行导致的，还有就是debug模式比release慢很多。

```rs
use chrono;
use reqwest::Client;
use tokio::{fs::OpenOptions, io::AsyncWriteExt};

extern crate tokio;

#[macro_use]
extern crate lazy_static;


static URL: &str = "https://jsonplaceholder.typicode.com/comments";

lazy_static! {
    static ref CLIENT: Client = Client::new();
}

// 这里改不改的影响不大
// #[tokio::main(worker_threads = 100)]
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let start = chrono::Utc::now().timestamp();
    let mut arr = vec![];
    for _i in 0..10000 {
        arr.push(run());
    }
    let end = chrono::Utc::now().timestamp();
    println!("任务添加完成时间: {}", end - start); // 0

    // 这种写法有400s+
    // for ele in arr.into_iter() {
    //     ele.await;
    // }

    // 改成这种降低至82s
    futures::future::join_all(arr).await;
    let end = chrono::Utc::now().timestamp();

    println!("执行时间: {}", end - start); // 
    Ok(())
}

async fn run() -> Result<(), Box<dyn std::error::Error>> {
    let str = CLIENT.get(URL)
        .send()
        .await?
        .text()
        .await?;
    let mut options = OpenOptions::new();
    let mut file = options
        .write(true)
        .read(true)
        .append(true)
        .create(true)
        .open("rust.txt")
        .await?;
    file.write_all(str.as_bytes()).await?;
    Ok(())
}
```

# 4 golang
golang用时：65s 提高线程数到100后，时间直接降低到20s左右，暴打java多线程
```
GOMAXPROCS=100 go run io-test.go
```
去掉写文件部分14s

# 5 结论
非极限情况下，线程池仍是一个性能极佳的选择。