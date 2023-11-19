extern crate dotenv;

use dotenv::dotenv;
use std::env;

fn main() {
    dotenv().ok();
    println!("k1={}", 
        env::var("k1").unwrap_or("".to_string()));
    println!("k2={}", 
        env::var("k2").unwrap_or("".to_string()));
}