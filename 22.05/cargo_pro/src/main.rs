use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("猜数游戏");
    
    let secret_number = rand::thread_rng().gen_range(1..101);

    println!("神秘数字是 {}", secret_number);

    loop {
        println!("猜测一个数");

        let mut guess = String::new();

        io::stdin().read_line(&mut guess).expect("无法读取行");

        let guess:u32 = guess.trim().parse().expect("输入的不是数字类型");

        println!("你猜的数是{}", guess);

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("too small"),
            Ordering::Greater => println!("too big"),
            Ordering::Equal => {
                println!("you win");
                break;
            },
        }
    }
}
