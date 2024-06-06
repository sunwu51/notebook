# 智能指针
引用是不智能的指针，只是借用数据，而智能指针持有该数据的所有权，`String`和`Vec`就是智能指针的实现，这两种类型的数据大小是指针大小(可能还有些元数据信息例如string长度等)，而真正的数据是存储到堆上面的。

智能指针除了能像指针一样的使用结构体，还
# Deref/Drop
智能指针是怎么实现的呢？智能指针一般指实现了`Deref`和`Drop`特征的`结构体`。

引用类型是个地址，所以我们可以用`*r`下钻地址，拿到对应的数据。但如果一个结构体`T`实现了`Deref`那么也就能使用`*t`。但是本质上`&`引用与智能指针不一样，`&`本质是直接取地址，是rust最基本的特性。`*智能指针`是通过调用`deref`方法。`智能`还体现在函数参数会自动`deref`去适配合适的形式。例如下面例子，函数签名是`&str`，而实际传入`&String`却不报错，因为`String`是智能指针，所以会自动`deref`，变成`str`，于是匹配`&str`成功。这个“智能”非常有用，大大简化代码，智能deref是可以递归，多次触发。但是这个特性会有缺点，就是入参如果是特征约束，很可能不知道解到哪一层实现的特征。
```rs
fn run(s: &str){}

run(&String::from("123"));
```
自动解引用其实不止在作为函数参数时，可以显示的声明变量类型，编译器也知道需要自动解。以及当调用解引用之后才会有的方法时。`&&&&&&&v`这种多充引用可以归一化成`&v`。
```rs
fn main() {
    let s = Box::new(String::from("hello, world"));
    // &s本来是&Box<String>，但是显示的声明可以自动解引用
    let s1: &String = &s; // 自动解一次
    let s1: &str = &s;    // 自动解两次

    // 智能指针上调用解引用之后才有的方法，也可以自动解
    let s2: String = s.to_string();
}
```
归一化，下面代码中f是`&&Foo`类型，但是可以自动解多个&仍能自动解为`Foo`类型，并找到里面的foo方法。
```rs
#![allow(unused)]
fn main() {
    struct Foo;

    impl Foo {
        fn foo(&self) { println!("Foo"); }
    }

    let f = &&Foo;

    f.foo();
    (&f).foo();
    (&&f).foo();
    (&&&&&&&&f).foo();
}
```

而`Drop`是当变量离开作用域的时候被调用的清理函数，因为智能指针指向真实数据，并拥有数据的所有权，需要对数据的销毁负责，所以需要实现`Drop`特征。智能指针的`drop`函数不能手动调用，但是可以通过drop包中的drop函数(预置在std::prelude里)来清理。`Copy`和`Drop`是互斥的，



# `Box<T>`
`Box`是最简单智能指针，只是将`T`分配到了堆上面，并且`Box`本身代表指向堆内存的地址。
# `Rc<T>与Arc<T>`
`Box`在图结构，多线程等场景受限，因为Box需要拥有内部结构的所有权，嵌套的话就只能被root持有，就不够灵活了。多线程则是持有同一个数据的时候，rust默认不允许，这需要专门的数据结构来支持。

`Rc<T>`引用计数(reference counting)，内部会存储变量被引用的次数，0次就可以清理了。换句话说Rc管理的数据，是堆上分配内存，且数据真正清理需要满足自己的规则：该变量引用归零。
```rs
use std::rc::Rc;
fn main() {
    // Rc::new是创建一个Rc变量，与Box类似，同时这段堆内存引用计数为1
    let a = Rc::new(String::from("hello, world"));
    {
      // Rc::clone(&Rc)则是clone一份，并且计数+1
      let b = Rc::clone(&a);
      println!("{}, {}",  // 2, 2 a其实和b一样了
        Rc::strong_count(&a), 
        Rc::strong_count(&b));
    }
    println!("{}",  // 1 b被清理，引用-1，因为Rc的drop是引用-1，而不一定清理数据(0的时候清理)
        Rc::strong_count(&a));
}
```
Rc就非常适合用来实现图结构，例如最简单的链表。next的类型，Option.None要来表示Null。而此时必须用Rc，因为直接ListNode，会说无法推断一个递归类型的内存占用。
```rs
struct ListNode<T: Debug> {
    val: T,
    next: Option<Rc<ListNode<T>>>,
}

fn main() {
    let mut l1 = ListNode{val: "1", next: None};
    let mut l2 = ListNode{val: "2", next: None};
    let mut l3 = ListNode{val: "3", next: None};
    // 因为Rc::new完了，所有权就交给Rc内部了，所以下面两行不能互换，互换后，l2.next其实已经无法访问到数据了，l2已不再持有所有权。
    l2.next = Option::from(Rc::new(l3));
    l1.next = Option::from(Rc::new(l2));

    print_list(&l1);
}

fn print_list<T: Debug>(root: &ListNode<T>) {
    println!("{:?}", root.val);

    // 注意这里不能用into_iter，因为iter，遍历的是&Rc类型而into则是Rc类型，后者有所有权的，如果直接在for中使用，会影响引用计数的，所以不允许。报错·cannot move out of `root.next` which is behind a shared reference·
    for ele in root.next.iter() {
        print_list(ele);
    }
}
```
大多数时候我们遍历iter中的元素都是遍历的元素的引用，很少直接操作元素本身，所以直接用`iter`或者`as_ref().into_iter()`。

Arc是Rc的Atomic版本，其实就是多线程版本。不过Arc位于`std::sync::Arc`而Rc位于`std::rc::Rc`，两者有相同的API。只不过Rc不能跨线程使用，Arc可以。下面代码报错，换成Arc，即可修复错误。Arc实现成本较高，但是保证了多线程安全。
```rs
let s = Rc::new(1);
for _ in 0..10 {
  let s = Rc::clone(&s);
  let handle = thread::spawn(move || {
    println!("{}", s)
  });
}
```
```
193 |           let handle = thread::spawn(move || {
    |  ______________________^^^^^^^^^^^^^_-
    | |                      |
    | |                      `Rc<i32>` cannot be sent between threads safely
```
# Cell与RefCell
上面单链表其实还有个问题，就是如果我想改某一个节点的值是无法做到的，因为单链表构建完成后，除了root节点其他节点都被`Rc`所持有了，`Rc`没实现可变的解引用。
```rs
let mut l3 = l1.next.as_ref().unwrap().next.as_mut().unwrap();
l3.val = "333";
```
```
error[E0596]: cannot borrow data in an `Rc` as mutable
   --> src\main.rs:288:18
    |
288 |     let mut l3 = l1.next.as_ref().unwrap().next.as_mut().unwrap();
    |                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ cannot borrow as mutable
    |
    = help: trait `DerefMut` is required to modify through a dereference, but it is not implemented for `std::rc::Rc<ListNode<&str>>`

error[E0594]: cannot assign to data in an `Rc`
   --> src\main.rs:289:5
    |
289 |     l3.val = "333";
    |     ^^^^^^^^^^^^^^ cannot assign
```
这时候就出现了使用`RefCell`，一般ReCell就是配合Rc使用的，Rc套RefCell，cell是细胞单元的意思，refcell就是一个细胞里放了一个ref的意思，有borrow和borrow_mut两个最常用的方法，返回值是`Ref`和`RefMut`类型，可以像引用一样的使用返回值。
```rs
struct ListNode<T: Debug> {
    val: T,
    next: Option<Rc<RefCell<ListNode<T>>>>,
}
// 嵌套很多层： Option是为了表示Null节点，Rc是为了固定大小且多个节点可以对数据有所有权，RefCell是使Rc内容是具有动态可变性(其实就是可以改Rc内的值)，ListNode就是下一个节点的真正内容。

fn main(){
    let mut l1 = ListNode{val: "1", next: None};
    let mut l2 = ListNode{val: "2", next: None};
    let mut l3 = ListNode{val: "3", next: None};
    l2.next = Option::from(Rc::new(RefCell::new(l3)));
    l1.next = Option::from(Rc::new(RefCell::new(l2)));

    // l3.val = "333"; l3已经被Rc持有了，已经无效了
    
    // l2是Ref类型
    let l2 = l1.next.as_ref().expect("l1 no child").borrow(); // as_ref很重要，因为不as_ref那l1的所有权就通过next转移了。后续就没法用l1了。

    // l3是RefMut<ListNode>类型，但是要修改L3还是要声明为mut
    let mut l3 = l2.next.as_ref().expect("l2 no child").borrow_mut();
    l3.val = "333";
    // drop很重要，l3是第三个ListNode的可变引用，后面的print函数挨着打印的时候，到第三个节点也会对齐进行引用，此时同一上下文就有可变引用和不可变引用同时存在，触发panic，Ref drop后是销毁当前Ref而不会干掉内部的数据。
    drop(l3);
    print_list(&l1);
}
```
解释下，为啥`l1.next`会转移l1的所有权，使得l1不能再用了。因为`next`是l1结构体的一部分，他赋值给新的变量，其实就意味着l1的部分所有权被转出了。partial move也是move，不能再用了，通过`as_ref`来解决这个问题，并且`l1.next.as_ref()`，要打包出现，不能先next赋值给一个变量了，再as_ref，那变量就已经持有所有权了。
```
borrow of partially moved value: `l1`
partial move occurs because `l1.next` 。。。
```
# todo
`Rc`面对循环引用无限计数，需要有`Weak`弱引用，不进行计数，也不持有所有权。

`RefCell`还有个不存Ref而是存T的版本`Cell`。他们都是线程不安全的，需要线程安全还需要`Mutex`和`RwLock`。