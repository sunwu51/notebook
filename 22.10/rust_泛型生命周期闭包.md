# 概述
本文主要讲rust中的生命周期部分，因为和泛型类似都是写到`<>`中的，所以把泛型也顺带复习一下。
# 泛型
泛型可以在结构体、枚举和方法中使用。java中枚举显然不能使用泛型，这也是一个重要的区别。使用时直接在类型名后面加`<T>`
```rs
// 结构体中使用泛型
struct Point<T,U> {
    x: T,
    y: U,
}
// 枚举中使用泛型
enum Option<T> {
    Some(T),
    None,
}
// 普通方法中使用泛型
fn echo<T>(a: T) -> T {
  return a;
}
```
泛型结构体实现方法时有多种情况，例如
```rs
struct Point<T>{
    x: T,
    y: T,
}
impl<T> Point<T> {
    // 普通的函数注入
    fn hello(&self){
        println!("hello");
    }
    // 使用了T作为参数或者返回值类型，注意函数后面不要再加<T>
    fn set_x(&mut self, x: T){
       self.x = x;
    }
    // 与T无关的其他泛型函数
    fn echo<U>(&self, v: U) -> U{
        v
    }
    // 既使用了T又新引入了U的函数
    fn set_x_and_echo<U>(&mut self, x: T, v: U) -> U{
        self.x = x;
        v
    }
    // 用trait约束泛型，既可以对U约束，也可以对T约束
    fn set_x_and_echo_with_trait<U>(&mut self, x: T, v: U) -> U
    where U: Clone, 
          T: Clone + Copy
    {
        self.x = x;
        v
    }
}
```

对于有约束的函数例如上面的`set_x_and_echo_with_trait`我们对T有Clone和Copy的约束，而如果我们生命的Point中T是String(没有实现Copy)，如下面代码，调用set_x_and_echo_with_trait报错，说String没实现Copy，所以不能调这个方法。
```rs
fn main(){
    let mut p = Point{x: "1".to_string(), y: "2".to_string()};
    p.set_x_and_echo_with_trait("3".to_string(), 1);
}
```
```
error[E0277]: the trait bound `String: Copy` is not satisfied
   --> src\main.rs:153:7
    |
153 |     p.set_x_and_echo_with_trait("3".to_string(), 1);
    |       ^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `Copy` is not implemented for `String`
    |
note: required by a bound in `Point::<T>::set_x_and_echo_with_trait`
   --> src\main.rs:141:22
    |
139 |     fn set_x_and_echo_with_trait<U>(&mut self, x: T, v: U) -> U
    |        ------------------------- required by a bound in this
140 |     where U: Clone,
141 |           T: Clone + Copy
    |                      ^^^^ required by this bound in `Point::<T>::set_x_and_echo_with_trait`
```
如果使用实现了Copy的i32类型则正常运行
```rs
fn main(){
    let mut p = Point{x: 1, y: 2};
    p.set_x_and_echo_with_trait(3, 1);
    println!("{}", p.x)
}
```
泛型的约束也可以加到`impl<T: Copy+Clone>`，来表示下面的所有方法都只适用于实现了Copy和Clone的类型T。等价于每个函数里约束T。
# 生命周期
声明周期一般用`'a`这种形式表示，他和泛型一样，都是表示一个声明，表示现在有个一声明周期假如叫a。

生命周期标注只是对于编译器有用的，实际运行没有实质作用。生命周期标注只对引用类型有用，因为只有引用类型的生命周期可以被标注，普通变量类型的生命周期就是作用域结束。

经常会用于返回引用的函数，因为函数返回引用意味着返回的值是没有数据的所有权的，那可能就会在后续使用时数据被清理，所以通过声明生命周期的方式可以保持和某个入参一样的生命周期，如下，并且提供以下语法糖：
- 1 当入参只有一个引用类型，且返回值要和该引用声明周期相同的时候就不需要加`'a`声明。
- 2 如果有&self作为参数，那返回值如果是引用，生命周期与&self保持一致。
```rs
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```
`'a`并不改变程序运行逻辑，只是通知编译器两者生命周期相同，让编译器能允许通过该前提下合法的写法。像上面的函数就是最经典的场景，我们还可以把返回值的x改为`"1"`这样的字面量，因为字面量生命周期是`'static`肯定是包含`'a`的，那也可以通过编译。而如果入参xy生命周期不同，那a指最小的。但是如果返回值改为
```rs
let str = String::from("xx");
return &str[..]
```
那么就会报错`returns a value referencing data owned by the current function`。
# 结构体与生命周期
结构体的建议写法是不要写引用类型的成员变量，因为引用类型意味着该变量的所有权不归结构体所有。那么很有可能在使用结构体的时候，变量已经被清理了。

但是有了生命周期标注，就可以使用引用了。结构体的生命周期标注，向编译器声明了这样一件事：使用该标注的字段存活的一定比自己久。如下，name的存活的一定比结构体久。a代表的是Person的生命周期。当然了，如果写出了不符合这个规定的代码，编译也会不通过。
```rs
struct Person<'a> {
    name: &'a str,
}
// 与泛型类似，如果要实现方法写法如下
impl<'a> Person<'a> {//Person<'a>才是结构体全名，缺少<>是不对的
    // 注意返回值类型，应该是&'a str，但是因为语法糖2，与self保持一致，所以就可以省略'a
    fn get_name(&self) -> &str {
        self.name
    }
}
// 生命周期没有trait约束，但也有周期约束，b是a的子集,通俗讲就是a比b活得久
// 如果没有b约束的话(去掉:'b)，下面代码就会报错，因为a与b无任何关系，要求返回b，但是返回a自然报错，但是加了约束，说明a活的更久啊，所以就没错了。
// 期望一个3年工作经验的，给了个5年的，莫得问题
impl<'a: 'b> Person<'a> {
    fn ff(&self, another_name: &'b str) -> &'b str {
        self.name
    }
}
```
因为生命周期标注只是一个辅助编译的声明，不产生实质作用。所以如果代码确认没错，可以用`'a: 'static`来表示`'a`是永存的，当然只是告诉编译器这个信息，实际运行还是会被回收的，因为编译器知道是永存的，那么任何&self方法的返回引用，都可以是任意周期的引用了。一路绿灯，但是这样比较危险。
# 生命周期一直在
在函数的入参和返回值上，但凡是引用类型，他都是有生命周期的，编译器看到的是：
```rs
fn f(x: &str, y: &str)->&str
===>
fn f(x: &'a str, y: &'b str)->&'c str
// 当然了这个函数编译不过，因为c和ab无关
```
如果加了标注约束，那编译器知道c是和ab都一致的，所以就可以编译通过。
```rs
fn f<'a>(x: &'a str, y: &'a str)->&'a str
```
# 同时使用T和'a
泛型和生命周期同时出现的时候，生命周期需要写在前面。
```rs
struct Personss<'a, 'b, T> {
    name: &'a str,
    age: &'b u32,
    v: 'a T,
}
```
NLL (Non-Lexical Lifetime)是指新的rust（1.31）编译器中，引用的生命周期在最后一次使用之后结束，而不需要到作用域结束。
```rs
fn main() {
   let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    // 新编译器中，r1,r2作用域在这里结束

    let r3 = &mut s;
    println!("{}", r3);
}
```
Reborrow 再借用，如下，rr是对r解引用后的引用。rr与r一样都是`&i32`类型，但是在借用不算借用，也就是说不会影响存在的借用数量。例如rust规定可变引用只能有1个，且不能同时再有不可变引用。但是在借用不算引用。
```rs
let r = & 1;
let rr = &*r;

// r是可变引用，rr是不可变引用，但是rr是在借用不算借用，所以不算破坏规则。
let r = &mut 1;
let rr = &*r;
```
在借用好像可以打破原来的规范，使得一切变得不安全。好在在借用有使用限制，就是在借用从声明到最后一次使用的期间，不能在使用借用`r`。

NLL，使得先使用`&mut`，用完再用`&`，变得合法，即我们可以`(--){--}(--)`（前括号是声明，后括号是结束使用）的来使用引用。

Reborrow，使得先声明了`&mut`，然后又声明`&`，并使用`&`完之后，再去使用`&mut`变得合法。`{()()}`，因为在借用严格规定不能出现交叉，即在借用生命周期中不能出现原借用，所以也能保证安全性。