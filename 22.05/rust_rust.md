# rust
自动内存清理的底层编程语言 [官方在线代码平台](https://play.rust-lang.org/)
# 基本语法
## 1 基本的数据类型和常用方法
基础类型主要4大类
- 整形i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize，默认是i32。不同整形可以直接加减乘除运算。
- 浮点型f32 f64，默认是f64。不同浮点型也可以运算，但是整形和浮点型不能运算。
- 字符char，单引号是char，双引号是str。底层是utf8编码，即一个char不只是一个字节。
- 布尔bool，true/false

```rs
fn main() {// 函数用fn来声明，main是入口函数
    // 基础的变量赋值，有自动类型推断
    let a1: i32 = 10;
    let a2 = 10;
    let a3 = 10i64;//i64的10
    let a4: i64 = 10 as i64; //类型不能自动转，需要用as进行转换
    
    let str1 = "hello"; // str1类型是字面量&str，&str通过to_string转为String对象
    let str2 = String::from("hello");// 将字符串复制一份到堆上，返回堆的引用，as_str()可以转为字面量
    
    let arr = [1, 2, 3, 4]; // 数组
    let arr2 = [-1;5]; // 长度是5，每个值都是-1
    let arr3: [i32; 5] = [-1;5]; // 数组类型也是;隔开类型和个数

    let tuple: (i32, &str) = (1, "123");
    let tuple2 = (1, "123");

    // 字符串 String底层存储类似java的ArrayList<Character>是不断扩容的char数组。
    // 1 "abc"是字面量&str，编译器分配，而正常的操作用的String。两者通过to_string as_str互转。
    // &str与&String大多数情况下可以互相顶替
    let s1 = "abc";
    let s2 = String::from("abc");
    let s3 = "abc".to_string();
    
    assert_eq!(s1, s2);
    assert_eq!(s2, s3);


    // 2 求长度
    println!(s2.len());
    // 3 去掉首位空格
    println!(s2.trim());
    // 4 增删改查操作
    let mut ms1 = "1".to_string();
    ms1.push('2');  // 追加字符-----12
    ms1.push_str("345"); // 追加字符串 -----12345
    ms1.insert(0, '0'); // 指定位置插入字符，O(n) --------012345
    ms1.insert_str(0, "00"); // 指定位置插入字符串--------00012345
    
    assert_eq!(ms1.remove(0), '0'); //删除指定位置char，并返回 --- 0012345
    assert_eq!(ms1.pop(), Some(5)); //删除最后一个char，并返回Some --- 001234 （Some通过unwrap方法获取内部内容）

    ms1.replace("1234", "4321"); //替换符合条件的部分
    
    ms1.get(1..3); // 选取第1到第2个字符，作为Some(&str)返回。

    // 5 大小写
    ms1.make_ascii_uppercase(); // 原地转
    ms1.make_ascii_lowercase();
    ms1.to_ascii_uppercase(); // 返回新的String
    ms1.to_ascii_lowercase(); 

    // 6 拆分
    ms1.split(" ").collect(); // 按照空格拆分，并变成Vec<&str>
    let (first, second) = ms1.split_at(3); // 去掉第3个字符，前面的组成一组&str后面的是另一组，返回tuple

    // 7 starts_with ends_with 返回bool
    ms1.starts_with("0");

    // 数组


}
```
-------------------------------------------
暂时更新到这