# 数组与slice
先来看线性结构数组和切片，golang中数组是固定长度的，且数组的类型是带有长度信息的。例如`a:=[10]int{}`是不能作为函数`func f(arr [20]int)`的入参的，因为参数类型就不是一个。并且数组是值传递的。
```go
arr1 := [5]int{1,2,3,4,5}
arr2 := arr1
arr2[0] = 100
println(arr1[0]) //打印1，因为值类型是复制
```
而slice切片又叫变长数组，他的类型表示和数组类似只是`[]`中没有了长度，所以叫变长，这种动态特性使得slice不可能是值类型，其本身是个指针，是引用传递。
```go
arr1 := []int{1,2,3,4,5}
arr2 := arr1
arr2[0] = 100
println(arr1[0]) //打印100
```
slice声明方式除了上面这种类似数组的方式还可以
```go
    var s1 []int //声明0长度切片
    s2 := make([]int, 3) //make方式创建长度是3的slice
    s3 := make([]int, 3, 5) // 容量是5
```
slice的底层存储了三个信息，一个是指向的数组的第一个元素的位置，然后是长度和容量，当长度大于容量就触发扩容（之前容量翻倍）。通过`len`和`cap`获取slice的长度和容量，如果想要复制内部元素需要`copy(target, origin)`。

如果我们直接创建一定cap的切片，内存中是会先创建这个长度的数组。

![image](https://i.imgur.com/GTDog1T.png)

```go
s1 := make([]int, 2, 5)
println(len(s1), cap(s1))
s1 = append(s1, 1)
s1 = append(s1, 1)
s1 = append(s1, 1)
s1 = append(s1, 1)
println(len(s1), cap(s1)) // 6 10
```
slice支持python类似的`[:]`语法，`s1[50:100]`从50到99。因为slice是引用类型，所以截取的slice的修改会影响原slice内部的值。
```go
s1 := []int{1,2,3}
s2 := s1[:2]
s2[0] = 0
println(s1[0])
```
数组和切片遍历，都可以使用基本的for循环遍历，也可以使用`for range`
```go
for i=0; i<len(s1); i++ {
    s1[i]
}

for i, item := range s1 {
    ..
}
```

# list.List
List底层是双向链表，有`PushFront`,`PushBack`,`Remove(*Element)`等方法。使用：
```go
import ("fmt" ; "container/list")

func main() {
    var x list.List
    x.PushBack(1)
    x.PushBack(2)
    x.PushBack(3)

    for e := x.Front(); e != nil; e=e.Next() {
        fmt.Println(e.Value.(int))
    }
}
```
# map
golang中的map类型声明方式如下，默认的map是hashMap。
```go
var m1 map[string]int // m1默认是nil，必须用make分配
m2 := make(map[string]int)
m3 := make(map[string]int, 10) // 初始容量是10的map
m4 := map[string]int{
    "a":1,
    "b":2,
}// 声明的时候直接初始化

m2["a"] = 1    //像数组一样直接用[]进行get set
println(m2["a"])
```
求长度仍然使用`len(m1)`，删除某个元素用`delete(m1["a"])`函数，遍历和数组一样可以使用`
for k, v := range map`。

注意map与slice一样是引用类型，所以是指针复制，因为使用的make关键字创建的。

golang sdk中没有set的实现，需要自己用map来实现set，或者用github上提供的第三方set库。
# struct
struct声明如下，每个字段之间不需要用逗号隔开。字段首字母的大小写决定了访问的私有还是共有
```go
type User struct{
    name string `这是标签可以写可以不写，反射中可获取`
    age int
}
```
声明的时候可以赋字段初值，否则是默认值
```go
u1 := User{name: "a", age: 1}
u2 := User{"a", 1}

var u3 User
u3.name = "a"
u3.age = 1
```
结构体是值类型，如果需要转为指针可以直接在声明的时候&。只有指针类型的数据，才有可能在逃逸的时候在堆上申请空间。
```go
u1 := &User{name: "a", age: 1}
```

对结构体追加方法，对写操作用指针类型，读操作用普通类型或指针类型均可，建议都指针类型。
```go
func (this *User) SetName(name string) {
    this.name = name
}
```
继承
```go
type VipUser struct {
    User
    vipNum int
}
```
# interface
接口的声明，只要结构体实现了接口中的方法，那么就是实现了接口，不需要显示的声明，是一种轻量的无侵入的实现方式。
```go
type Hello interface{
    SayHello()
    GetName() string
}

func (this *User) SayHello(){
    fmt.Println("hello")
}

func (this *User) GetName() string{
    return this.name
}
```
接口也是一种类型，可以作为变量类型，参数类型，返回值类型。
```go
func f(h *Hello) {
    h.SayHello()
}
```
万能的`interface{}`类型，所有的数据类型都实现了他，所以作为参数入参，可以接受任意类型的参数。一般会配合类型的断言来使用，或者使用反射
```go
import (
    "fmt"
    "reflect"
)

func f(arg interface{}) {
    v, ok := arg.(string)
    if !ok {
        ...
    } else {
        ...
    }
    // 反射
    tp := reflect.TypeOf(arg)
    for i :=0; i<tp.NumField(); i++ {
        fieldValue := tp.Field(i).Interface()
    }
    //... 
}
```

