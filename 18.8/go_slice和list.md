# slice list
slice和list是go语言中常用的两种线性存储结构。在呈现出的特性上都是可以改变长度的，灵活线性结构。
## 1 slice
slice在go中经常被称为数组的引用，他的底层存储结构是数组。所以和java中`ArrayList`非常像，可以直接快速的读写某个位置的元素。我们来看下slice的声明和读写方式：
```go
s2 := make([]int,0)
s2 = append(s2, 1,2,3,4,5,6)
fmt.Println(s2[1])
s2[1]=111
fmt.Println(s2[1])
```
通过make一个`[]int`类型并指定初始长度，这里就声明了一个slice，注意我们说slice是数组的引用，这里体现在会创建一个长度为该值的数组，填充默认值int默认值为0.

直接通过s2[x]来对slice中的数进行读写。类比于java中ArrayList的get/set方法。

**不同**我们强调slice是数组的引用，而java中的ArrayList的接口并没有数组的任何影子。所以还是存在一些不同的。
比如
- ArrayList也可以指定初始数组大小，但是这对程序运行结果没有影响。而slice却不是
- Slice声明自一个数组，不管是make方式还是直接切数组都是来自数组的。
- Slice的append是原来slice追加元素后返回一个新的slice，这个新的slice也是原来那个数组的引用（如果扩容则不是了），而ArrayList是直接在原来基础上追加。

思考下下面这段代码的原因
```go
arr:=[]int{1,2,3,4}
s:=arr[:2]             //s:[1,2]
s2:=append(s, 1)       //s2:[1,2,1]
fmt.Println(s,s2,arr)  //arr:[1,2,1,4]
//slice也是arr的引用，所以append会直接改变arr中的值

arr:=[]int{1,2,3,4}
s:=arr[:2]             //s:[1,2]
s2:=append(s, 1,1,1)   //s2:[1,2,1,1,1]
fmt.Println(s,s2,arr)  //arr:[1,2,3,4]
//这里arr竟然还是原来的值，原因在于slice的扩容机制，当初始大小4不够承了，数组会扩容为2倍大小（>1024是1.25倍）。此时slice是扩容后的数组的引用，而不是arr的引用了，所以产生的改变不作用于arr了。
```
就是说这个数组的存在没有java中那样，对用户透明。

slice函数调用  
思考下面代码的原因：
```go
func main(){
    a:=[]int{1,2,3,4}
    s:=a[0:2]
    test(s)
    fmt.Println(s)//1,111
    fmt.Println(a)//1,111,11,4
}
func test(s []int){
    s[1]=111
    s = append(s,11)
}
```
函数参数中的s是对原s的复制，其也是对a这个数组的引用，当修改s[1]的时候，最源头的a[1]被改变了，所以外面的s[1]也会变化。而紧接着append的时候因为大小没有超过a，所以a被改为了1,111,11,4但是外面s还是选的a前俩元素，所以没有影响。

还有个点就是slice作为参数的时候类型是`[]int`，是不是和数组很像呢？数组要用`*[]int`指针传入。

## 2 list
list类比于java的LinkedList是双向链表。可以模拟队列和栈。list需要引入"container/list"
```go
l:=list.New()
l.PushFront(1)
l.PushFront(2)
l.PushFront(3)
l.PushBack(-1)
l.PushBack(-2)
l.PushBack(-3)
for f:=l.Front();f!=nil;f=f.Next(){
	fmt.Println(f.Value)
}
//3 2 1 -1 -2 -3

l.Remove(l.Front())
l.Remove(l.Back())
for f:=l.Front();f!=nil;f=f.Next(){
	fmt.Println(f.Value)
}
//2 1 -1 -2
```
以上可以看出list就是一个双向链表可以从两头插入和删除，可以通过指针的方式遍历元素和删除元素。list也封装了一些插入到某个元素前后，将一个元素移动到另一个元素前后的方法，当然我自己没怎么用到这些方法。



