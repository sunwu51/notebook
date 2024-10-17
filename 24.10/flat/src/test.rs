use rand::{thread_rng, Rng};
use std::fs::OpenOptions;
use std::io::Write;

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn write_rand_file() {
        // 设置要写入的文件名
        let filename = "output.txt";

        // 打开文件以进行追加
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(filename)
            .expect("无法打开文件");

        // 创建一个随机数生成器
        let mut rng = thread_rng();

        // 生成1000行随机字符串
        for _ in 0..1000 {
            let length = rng.gen_range(1..=100); // 随机生成1到100之间的长度
            let random_string = generate_random_string(length);
            writeln!(file, "{}", random_string).expect("写入文件时出错");
        }

        println!("成功向文件中追加了1000行数据。");
    }
    // 生成随机字符串
    fn generate_random_string(length: usize) -> String {
        // 字母和数字的集合
        const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let mut rng = thread_rng();

        // 随机选择字符并构建字符串
        (0..length)
            .map(|_| {
                let idx = rng.gen_range(0..CHARSET.len());
                CHARSET[idx] as char
            })
            .collect()
    }
}
