# 内存回收
内存回收主要是指堆内存的回收，在C/C++中`malloc`的内存需要自己来`free`，而在java、golang中会有自动触发的定期的垃圾回收。

本文主要来思考以下几个问题
- 1 为什么需要堆内存，只用栈的形式有什么局限
- 2 手动内存清理和gc分别的优势和缺点是什么
- 3 rust是如何实现能自动实时回收的

# 1 堆 栈
仅有栈内存的话，即所有函数内创建的变量内存都会在函数运行完成后清理掉。无法解决逃逸问题，例如
- return一个地址或者java中的对象，在当前函数结束后，栈被清理，该对象也就清理掉了，父函数拿到的是空数据。
- 如果函数中是对父函数中的变量属性赋值，例如java中要对全局的`Object[]`的某一个元素赋值，函数运行完同样内存被清理。

# 2 手动 vs gc
手动清理的性能好，内存利用率高适合系统级编程，但是容易出现内存泄漏（忘记清理）和多次清理导致异常的问题。java go的gc自动定期清理算法保证了上述问题，但是性能较低，不适合底层编程。
```c++
#include <stdio.h>
#include <stdlib.h>
int* f(){
    int* x = malloc(sizeof(int));
    *x = 99;
    return x;
}
void f2(int* p){
  // do something
  free(p);
}

int main()
{
    int *p = f();
    printf("%d", *p);
    f2(p);   // f2中清理过了
    free(p); // 两次清理出错。
    return 0;
}
```
# rust
从c的角度来看，我们需要做的是清理那些malloc出来的内存，即每个malloc都应该有个free。

Rust的思路是这样的，变量所在的作用域结束后会清理占用的堆内存，这和栈基本一致。为了解决多次清理问题，一个对象只能被一个变量名所拥有，即所有权只在一个变量名下。下面函数报错，因为`b = a`这行，鉴于String类型没有实现Copy trait，意味着等号不会复制字面值，而是直接移交所有权给b，此时变量名a就失去任何意义了。
```rs
fn main() {
    let a  = String::from("hello");
    let b  = a;
    println!("{}", a); //borrow of moved value: `a`
}
```
同样如果作为参数传入函数，和作为函数的返回值也会移交所有权，下面调用函数同样因为所有权的移交导致自己无法再使用a。
```rs
fn main() {
    let a  = String::from("hello");
    f1(a);
    println!("{}", a); //borrow of moved value: `a`
}
fn f1(s : String){
    return
}
```
作为返回值也会移交所有权，可以通过移交给函数内，然后再return回来的方式拿回所有权
```rs
fn main() {
    let mut a  = String::from("hello");
    a = f2(a); // a所有权给了f2作用域，又拿了回来
    println!("{}", a); 

}
fn f2(mut res :  String) -> String {
    res.push_str(" world");
    return res; // 又将所有权返回给调用的地方
}
```
上述模型太麻烦了，引入了引用/借用的概念
```rs
fn main() {
    let mut a  = String::from("hello");
    f2(&mut a); // &mut a是a的可变引用，当然前提a要是mut的引用才能是mut的
    println!("{}", a); // hello world
}
fn f2(res :  &mut String) {
    res.push_str(" world");
}
```


