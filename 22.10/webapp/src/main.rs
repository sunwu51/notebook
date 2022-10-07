#[macro_use]
extern crate rbatis;

use std::error::Error;
use rbdc_mysql::driver::MysqlDriver;
use serde::{Deserialize, Serialize};
use rbatis::{rbdc::datetime::FastDateTime, Rbatis};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Option<u64>,
    pub name: Option<String>,
    pub create_time: Option<FastDateTime>,
}

crud!(User{});

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>>{
    let mut rb = Rbatis::new();
    rb.init(MysqlDriver{},"mysql://root:@localhost:3306/rs").unwrap();
    let u = User{id: None, name: Some("frank david2".into()), create_time: Some(FastDateTime::now())};
    // let data = User::insert(&mut rb, &u).await;
    let exist_u = User::select_by_column(&mut rb, "id", &u.id).await.ok();

    if exist_u.is_none() {
        panic!("select sql error");
    }
    if exist_u.unwrap().is_empty() {
        let insert_res = User::insert(&mut rb, &u).await?;
        println!("{:?}", insert_res);
    } else {
        let update_res = User::update_by_column(&mut rb, &u, "id").await?;
        println!("{:?}", update_res);
    }

    Ok(())
}
