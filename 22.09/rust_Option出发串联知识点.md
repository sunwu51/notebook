# enum
rust中的枚举比其他语言中的枚举要更重要一些，因为经常需要用到的一些系统提供的枚举例如`Option`,`Result`等。因为rust中没有null，所以Option的包装就很重要了。

# 基本的用法
在rust中结构体、枚举等复合类型在声明的时候采用的是驼峰规范，枚举内部成员也采用驼峰规范，且首字母大写。而结构体成员采用下划线规范。

此外是对于`::`和`.`的解释，一般`::`用于mod中申明的成员属性被其他mod使用的时候会用，例如use中。而`.`是调用结构体的属性的时候会用，而enumerate使用的时候不是调用自己属性，有点类似mod的概念，所以是用的`::`。

`#[derive(Debug)]`一般用在复合类型上，使其能够通过`{:?}`或者`{:#?}`来打印。

```rs
#[derive(Debug)]
enum Location {
    X,
    Y,
}

fn main() {
    println!("{}", Location::x);
}
```
# Option
rust中没有null但是有Option枚举，包含在`prelude`中（prelude是rust最常用的标准库的内容，直接提前引入了，不需要使用任何use就可以直接在代码使用），可以通过`Option::Some(1)`来直接创建一个enum内包含1的值，当然因为已经预置的原因也可以直接使用`Some(1)`，Option本身是位于`std::option`模块下的
```rs
enum Option<T> {
    Some(T),
    None,
}
```
使用，Option可以直接使用`:?`来打印。
```rs
fn main(){
    let s = Some(1);
    println("{:?}", s);
}
```
Option之间可以进行位运算，None类似false，Some则类似true，两个Some的and是返回第二个值。
![image](https://i.imgur.com/Vd2qnGH.png)

下面列举Option常用的函数
1 判断值：

`is_none`， `is_some`用于判断是None还是Some。

2 提取值 修改值：

`expect("panic msg")`提取some里面的内容，如果是None就panic，msg是该参数。`unwrap`提取里面的内容，可能抛出panic，是expect的阉割版，panic消息不能自定义。因为这俩都panic不建议使用，建议使用如下`unwrap_or(default_value)`内部是None则返回默认的值，`unwrap_or_else(||xxx return default_value)`与刚才类似，只不过是运行个函数。

`insert`修改内部的值，可以改None为Some，并返回`&mut T`，`get_or_insert` 如果是None则执行insert，否则返回内部。

3 stream操作：

`iter`,`iter_mut`,`into_iter`，前两个遍历的是引用`&T`/`&mut T`，`into_iter`的遍历类型取决于上下文，因为Option文档里有三种实现，`impl<T> IntoIterator for Option<T>`,`impl<'a, T> IntoIterator for &'a Option<T>`,`impl<'a, T> IntoIterator for &'a mut Option<T>`，也就是Option调用into_iter，遍历的是`T`,&Option遍历的是`&T`,&mut Option遍历的是`&mut T`类型。

`filter`接返回bool的过滤函数，返回`Option<T>`, `map`接返回`Option<U>`的映射函数，返回`Option<U>`, `map_or(map_func, u)`与map类似只不过返回值是U类型而不是Option类型，并指定默认值。

4 转换

`ok_or`转为Result类型
```rs
let x = Some("foo");
assert_eq!(x.ok_or(0), Ok("foo"));

let x: Option<&str> = None;
assert_eq!(x.ok_or(0), Err(0));
```

`and_then`，类似于map操作，是对Option进行个转换，None就不转了。需要返回`Some<U>`，U可以和T不同类型，如果self是None那一定返回None。
```rs
let o1 = Some(1);
println!("{:#?}", o1.and_then(|x| Some(format!("{}", x)))); // 打印1
```
`or_else`是当为None的时候运行个函数返回新的Option，注意新的Option和原来类型必须一致。
```rs
let o1: Option<u32> = None;
println!("{:#?}", o1.or_else(|| Some(22))); // 打印22
```

and_then => map, or_else => getOrDefault

# 知识点1：其他地方也常见到的xx_or和xx_or_else的语意
一般`xx_or`都是如果是Some就xx是None就返回第二个参数，而如果是`xx_or_else`那就是第二个参数是个函数，返回函数返回值。

# 知识点2：Option中看到的常见的trait的解释
## Clone与Copy
这是最基础的trait，Option也实现了这俩。

copy是隐式的，当我们使用`=`的时候，如果实现了copy那么就会在栈上隐式的执行。copy的前提是必须实现clone，并保证两者等效。相当于隐式的执行了clone，而不发生所有权转移。Copy不是随便就能实现的，为了性能考虑，rust不允许`大`的copy发生，所以大对象无法实现copy，即使加了`impl Copy for xx`也不行。Rust规定，对于自定义类型，只有所有的成员都实现了 Copy trait，这个类型才有资格实现 Copy trait。

clone是显示的调用`clone()`方法，将原数据clone一份，他可能是很深的拷贝也可能不是取决于如何写的clone方法。clone可以单独出现而不实现copy，此时就可以写一些自定义的逻辑在clone中。

Option实现了`Copy`，但是需要T也实现Copy才能完成隐式的拷贝。因为代码中有`where T: Copy`就是说T是可拷贝的那我就是可拷贝的。这种语法是其他语言目前还不能实现的。where写法可以有统一的声明，但在细节实现上，限制T的范围。这在知识点3中展开说明。

一般通过`#[derive(Clone)]`实现Clone，而`#[derive(Copy, Clone)]`实现Copy。这个派生注解，实际是帮我们写了`impl`部分代码的默认实现。
## Eq与PartialEq
判断两个对象是否相等 `==`，需要实现PartialEq，一般通过派生注解`#[derive(PartialEq)]`就是默认比较每个字段，如果内部有其他结构体没实现该接口就会报错.

![image](https://i.imgur.com/ZHB3ZGL.png)

Eq则比较简单，他必须基于前者，是一个简单的声明，声明自反性，例如`a == b`，partialEq其实不保证`b == a`, Eq则是声明了自反成立。

通常我们直接`#[derive(Eq, PartialEq)]`来使结构体满足自反相等的操作。

当一个类型同时实现了 Eq 和 Hash 时，该类型满足下列特性：
```
k1 == k2 -> hash(k1) == hash(k2)
```
## From与Into
std::convert下的两个接口，其中我们只需要实现from，into是自动的另一个类型中的函数，效果与from一致且不需要声明。

from的语意是从另一个类型转换成当前类型，Option实现了该Trait`let opi32 = Option::from(1);`，那这里同样我们发现使用的是`Option::from`是mod级别直接调用方法，而不是某个实例，这是因为trait中函数参数含有`&self`则是给实例注册的方法，而没有的话是给包注册的方法。

下面是使用Option中的from将i32转为Option，以及使用i32的into将i32转为Option，他们都是
```rs
let opi32 = Option::from(1);
let opi32 : Option<i32> = 1.into();
```
# 知识点3：泛型enum(struct也一样)中约束泛型
Option是个泛型enum，T可以是任何类型。例如源码中这一段，是实现clone的时候，必须T也实现clone，否则就无法使用该方法。
```rs
#[must_use = "`self` will be dropped if the result is not used"]
#[stable(feature = "rust1", since = "1.0.0")]
#[rustc_const_unstable(feature = "const_option_cloned", issue = "91582")]
pub const fn cloned(self) -> Option<T>
where
    T: ~const Clone,
{
    match self {
        Some(t) => Some(t.clone()),
        None => None,
    }
}
```
因而
```rs
let o1 = Some(1).clone(); // ok因为i32实现了clone
let o2 = Some(Point{x: 1, y: 2}).clone(); // panic，自定义结构体Point没有实现clone
```
顺带一提cloned上面的三个宏的作用：
- must_use是说如果该函数的返回值没有被接收，那会有个告警，msg就是后面的文本。
- stable就是当前函数是从rust哪个版本变稳定的
- rustc_const_unstable用于声明`const fn`目前还是不稳定的版本，之后稳定了会改成rustc_const_stable
# 知识点4：const fn
const函数是编译器就可以运行的函数，例如预先知道OS的位数来确定usize等用途。`const fn`当然也可以运行时使用，此时就和普通fn没有任何区别。一般在rust库中经常会看到`const fn`。
# 知识点5：关联类型与type关键字
Option有into_iter函数，是因为实现了`IntoIterator` trait，代码如下，这里有个type关键字。
```rs
#[stable(feature = "rust1", since = "1.0.0")]
impl<T> IntoIterator for Option<T> {
    type Item = T;
    type IntoIter = IntoIter<T>;
    #[inline]
    fn into_iter(self) -> IntoIter<T> {
        IntoIter { inner: Item { opt: self } }
    }
}
```
IntoIterator特征的源码
```rs
pub trait IntoIterator {
    #[stable(feature = "rust1", since = "1.0.0")]
    type Item;

    #[stable(feature = "rust1", since = "1.0.0")]
    type IntoIter: Iterator<Item = Self::Item>;

    fn into_iter(self) -> Self::IntoIter;
}
```
type如果不是出现在trait中，那么他的作用是给类型起别名的作用，比较简单。关联类型是在特征定义的语句块中，申明一个自定义类型，这样就可以在特征的方法签名中使用该类型。例如上面的into_iter在trait中定义的时候，返回值是`Self::IntoIter`(Self 用来指代当前调用者的具体类型，那么 Self::IntoIter 就用来指代该类型实现中定义的 IntoIter 类型)。

一般在trait声明的时候，可以直接`type name`，而在实现trait的结构体中指定type是什么类型。当然也可以在trait声明的时候给type加trait约束。
# 知识点6：pub的可见
pub表示是公开的，该关键字可以用来修饰模块`mod`，普通变量`let`、`const`，函数`fn`，结构体枚举等声明`struct`、`enum`，传递其他包`pub use xx::xx`。

父模块中的项即使不是pub，对子模块也都是可见的，而子模块中必须是pub的，父模块才能引用。