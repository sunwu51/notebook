# rust类型
rust的数据类型主要分为基础的数据类型像u8、i8、char等。还有复合数据类型结构体，元祖，枚举等。总体而言相比于java，是没有类，注解，接口的。因为没有接口实现接口化的编程就很难，所以提出了特征trait，特征有点像接口，但是又不太相同，特征本身其实不是一种类型而是一种约束，需要结合泛型来使用。

# 特征
例如我们想面向接口化编程，有个叫Api的接口，需要实现run方法，那么代码如下，这看上去除了需要把方法写在struct外面单独声明，其他的和java也没啥不一样，对吧。
```rs
trait Api {
  fn run(&self);
}

struct Api1 {}
struct Api2 {}

impl Api for Api1 {
  fn run(&self) {
    println!("api 1 running");
  }
}
impl Api for Api2 {
  fn run(&self) {
    println!("api 2 running");
  }
}
```
# 特征参数
trait和java的interface最本质的不同还是trait不是一种类型，而是一种约束。例如java中参数的类型或者返回值类型可以是一个接口，表示实现了这个接口的任何类都可以。而rust中下面写法不对
```rs
// Api不是一种类型所以下面写法报错
fn run_api(api: &Api) {
  api.run();
}
```
报错信息如下，特征对象必须加`dyn`关键字，我们后面再说dyn，总之因为Api本质不是一种类型，编译报错，这和java是不同的。

![i](https://i.imgur.com/vOmGGea.png)

trait是一种约束，他要和泛型配合，我们不断强调这话，来看下合法的写法吧，首先是最具有可读性的where写法，也最好理解，在这种写法中where表示对泛型类型T进行了约束，T必须实现了Api这个trait，where写法可以简化
```rs
// 以下三种写法完全等价
fn run_api<T>(api: &T) 
where T: Api
{
  api.run();
}

// 这种写法简单一些，但是如果有多个约束那么函数声明就会太长。适用于约束较短的情况，方便简单。
fn run_api<T: Api>(api: &T) {
  api.run();
}

// 最后一种写法是一种语法糖，因为经常接口化编程的参数是trait约束，所以提供了这种不用写泛型的简单写法。实际等价于上面
fn run_api(api: &impl Api) {
  api.run();
}
```
# 特征返回值
类似的我们很容易想到用特征约束返回值的写法。
```rs
fn gen_api() -> impl Api{
  Api1{}
}
```
下面我们来看一段代码的报错
```rs
fn gen_api(num: i32) -> impl Api{
  if num > 0 {
    Api1{}
  } else {
    Api2{}
  }
}
```
![iumage](https://i.imgur.com/2GKCgry.png)

上面代码是我们直觉的写法，因为前面我们说trait不是类型，是约束的写法，但是rust提供了`impl xx`语法糖，我们好像可以拿来当类型一样使用了。但是作为返回值的时候，如果出现动态的返回又会出问题。也就是我们根据运行时的参数来决定这个函数是返回`Api1`还是`Api2`了。这样就会报错。

本质上泛型作为入参或者返回值，假如实现trait的struct有100种，rust编译时是会自己派生100个函数声明，所以运行时是运行了特定的某一个函数。这也叫静态分发。但是上面的情况是动态分发，rust无法派生代码，因为编译期无法判断类型。

我们把上述代码等价的where写法写出来可能更好理解，泛型T需要实现Api，rust可以派生返回类型是Api1和Api2的两个函数，但是任意一个函数都无法满足函数内部的动态类型返回。
```rs
fn gen_api<T>(num: i32) -> T 
where T: Api
{
  if num > 0 {
    Api1{}
  } else {
    Api2{}
  }
}
```
# 特征对象
这种情况下就需要借助`dyn trait`关键字，特征对象。特征对象是一种类型，注意他不是一种约束啦，而是一种类型，这种类型必须配合`Box`或者`&`来使用，也就是dyn出现必须是以下形式之一
```rs
Box<dyn Api>
&dyn Api
```
特征对象中存放了两部分内容，普通Box中也会存放的指针和vtable地址的指针，前面的指针部分指向内存中的结构体，vtable则指向了该结构体中实现了该trait的方法（并没有其他方法）。因为只存放指针所以大小是固定的。

特征对象作为函数入参，两种形式的用法分别如下。其中第一种写法，也是本文第一个错误提示中建议我们的写法。
```rs
fn run_api(api: &dyn Api) {
  api.run();
}

run_api(&Api1{});// 调用

fn run_api(api: Box<dyn Api>) {
  api.run();
}

run_api(Box::new(Api1{}));// 调用
```

特征对象作为返回值，返回值不要使用引用，所以只有Box这种写法如下，因为特征对象是有固定大小的类型，所以就可以动态返回api1或api2了。下面两种都是合法的写法。
```rs
fn gen_api_dyn(num: i32) -> Box<dyn Api>{
  Box::new(Api1{})
}

fn gen_api_dyn(num: i32) -> Box<dyn Api>{
  if num > 0 {
      Box::new(Api1{})
  } else {
      Box::new(Api2{})
  }
}
```
特征对象隐式的具有`'static`生命周期，`Box<dyn Trait>`就跟`Box<dyn Trait + 'static>`是等价的
# 如何选择呢
首先是如果是动态的返回值那就只有Box+dyn这一种合法的写法，不需要考虑别的。而对于静态的分发场景来看的话，`trait约束`本质是编译器派生多份代码，`trait对象`则是一个新的类型包含两个指针。前者会产生更多的代码，但是运行时的效率要更高。并且可以通过where条件来应对复杂约束场景，dyn只能指定一个trait。并且dyn有一定限制，必须是安全的对象才能使用，例如trait中有方法是返回Self的就认为是不安全的。

最后我个人想法还是能用`impl trait`就用，不行再考虑dyn。
