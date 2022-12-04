use chrono;
use reqwest::Client;
// use tokio::prelude::{AsyncWrite, Future};

use tokio::{fs::OpenOptions, io::AsyncWriteExt};

extern crate tokio;

// extern crate time;

#[macro_use]
extern crate lazy_static;


static URL: &str = "https://jsonplaceholder.typicode.com/comments";

lazy_static! {
    static ref CLIENT: Client = Client::new();
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    let start = chrono::Utc::now().timestamp();
    let mut arr = vec![];
    for _i in 0..10000 {
        arr.push(run());
    }
    let end = chrono::Utc::now().timestamp();
    println!("任务添加完成时间: {}", end - start);
    futures::future::join_all(arr).await;
    let end = chrono::Utc::now().timestamp();

    println!("执行时间: {}", end - start);
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
