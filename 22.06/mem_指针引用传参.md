# C
C语言面向过程，主要数据结构除了int long float等，还有数组、指针和struct。这些数据类型均为值类型，函数调用传递的是值本身。

值类型的 = 操作，是对内存的深拷贝，所以改变拷贝后的值不影响原来的数据。
```c
int a = 1;
int b = a;
b = 2;
printf("%d", a); // 1
```
指针也是值类型的，他代表一个地址，地址本身是个数字，这个数字是值类型的，下面的例子虽然a的值被改变了，但是p在整个过程中代表的一直是地址，没有变化。
```c
int a = 1;
int *p = &a;
*p = 2;
printf("a=%d, p=%p", a, p); // a=2
```
这里是p改变了自己的值，此时p和q指针都指向数据b，数据a没有被指针指向而已，a还是1。
```c
int a = 1;
int *p = &a;
printf("p=%p", p);
int b = 2;
int *q = &b;
p = q;
printf("a=%d, p=%p, b=%d, q=%q", a, p, b, q); // a=1
```
下面来看结构体
```c++
#include <stdio.h>
#include <string.h>

struct user{
  int age;
  char* name;
  int* blood;
  char birth[6];
};

void main(){
  // 初始化结构体
  struct user u;
  u.age = 1;
  u.name = "123"; // char* 直接指向一个字符串常量
  strcpy(u.birth, "0101");  
  // 数组类型的没法像上面，必须自己赋值，strcpy或者*u.birth = '0'; *(u.birth+1) = '1';...都可以
  int blood = 1;
  u.blood = &blood; // int* 类型赋值

  // 第一步 直接u2=u1，struct会进行逐个字段的拷贝
  struct user u2 = u;
  // 拷贝到新的栈地址，所以地址不同
  printf("point: %p %p\n", &u, &u2); // point: 0x7ffeb3caa8d0 0x7ffeb3caa8f0
  // 内部字段是相同的，例如name birth *blood的值相同
  printf("name: %s %s\n", u.name, u2.name);
  printf("birth: %s %s\n", u.birth, u2.birth); // 123 123
  printf("blood: %d %d\n", *u.blood, *u2.blood); // 0101 0101
  // char* int* 指针类型的拷贝，是直接拷贝地址值，所以下面俩相同
  printf("name point: %p %p\n", u.name, u2.name); //name point: 0x563b4eb5e004 0x563b4eb5e004
  printf("blood point: %p %p\n", u.blood, u2.blood);//blood point: 0x7ffeb3caa8cc 0x7ffeb3caa8cc

  // ！！结构体中，数组的拷贝，不是拷贝地址，而是完整的拷贝一份新的
  printf("birth point: %p %p\n", u.birth, u2.birth); //birth point: 0x7ffeb3caa8e8 0x7ffeb3caa908


  // 接下来如果修改u2中的值，观察u1是否被影响
  u2.name = "456"; // 让u2.name指向另一个字符串常量地址，并不影响u1
  *u2.birth = '1'; // 修改char[]第一个元素的值，因为数组类型深拷贝，所以也不影响u1
  *u2.blood = 2;  // 修改int*的值，因为u1 u2的blood是指向相同地址的指针，所以u1也会被影响
  printf("name: %s %s\n", u.name, u2.name); //name: 123 456
  printf("birth: %s %s\n", u.birth, u2.birth);//birth 0101 1101
  printf("blood: %d %d\n", *u.blood, *u2.blood);//blood 2 2
  printf("name point: %p %p\n", u.name, u2.name);//name point: 0x563b4eb5e004 0x563b4eb5e07a
  printf("blood point: %p %p\n", u.blood, u2.blood);//blood point: 0x7ffeb3caa8cc 0x7ffeb3caa8cc
  printf("birth point: %p %p\n", u.birth, u2.birth);//birth point: 0x7ffeb3caa8e8 0x7ffeb3caa908
}
```
再来看函数调用，函数调用例如`void func(int x, int y)`在运行`func(a,b)`的时候，入栈时实参和行参需要执行转换，`int x=a; int y=b;`。
x=a是值类型的拷贝，所以说x是在函数栈中新开辟的空间，存了和a一样的值而已。下面的函数打印的a和b的值并不会交换。
```c++
void func(int x, int y){
  int t = x; // 形参交换，不影响实参
  x = y;
  y = t;
}
void func2(int *x, int *y){
  int *t = x; // 形参x拷贝了一下a的地址 y拷贝b的地址，两者交换x指向b，y指向a了
  x = y;      // 对a b的值没有任何影响
  y = t;
}
void main(){
  int a = 1;
  int b = 2;
  func(a, b);
  printf("a=%d, b=%d\n", a, b); //1 2
  func(&a, &b);
  printf("a=%d, b=%d\n", a, b); //1 2
}
```
正确的打开方式
```c++
void func(int *x, int *y){
  int t = *x; // xy还是ab的地址
  *x = *y;    // *x直接对a的地址进行修改，直接影响外部a的值了
  *y = t;
}
void main(){
  int a = 1;
  int b = 2;
  func(a, b);
  printf("a=%d, b=%d\n", a, b);
}
```
上面是int举例的，struct也是一样的。
```c++
#include <stdio.h>
struct user{
  int age;
  char* name;
}
void func(user u){
  u.age = u.age + 1;
}
void func2(user* u){
  *u.age = *u.age + 1;
}
void main(){
  user u;
  u.age = 10;
  u.name ="123";
  func(u);
  printf("%d\n", u.age);// 10
  func(&u);
  printf("%d\n", u.age);// 11
}
```

小结：函数传递参数是复制式的传递，如果是普通的值类型，那么函数内的改动不会影响变量本身，而通过传递指针和下钻指针内的内容就可以起到修改变量的效果；结构体默认是在栈上创建的；malloc才会在堆上创建内存。
# C++
C++是c的超集，所以上述特性是一样的，但是C++是面向对象的，所以有对象的概念，并且有引用类型。在C++中我们需要铭记：
- 1 对象有用new和不用new两种，new是堆，不new是栈，new是指针，不new类似struct，如果作为函数返回值一般需要new。

先声明个对象，后面用
```c++
#include <iostream>

using namespace std;
class Person {
public:
	int age;
	string name;
	Person(int age, string name) {
		this->age = age;
		this->name = name;
	}
};
```
new和不new的区别，除了堆栈区域不同，new的返回值是指针，不new的是值类型。
```c++
int main()
{
  Person p1 = Person(1,"1");
  Person p2 = Person(1,"1");
  Person *p3 = new Person(2,"2");
  Person *p4 = new Person(3,"3");
  printf("p1:%p, p2:%p, p3:%p, p4:%p\n", &p1, &p2, p3, p4);
  p1 = p2;
  p3 = p4;
  printf("p1:%p, p2:%p, p3:%p, p4:%p\n", &p1, &p2, p3, p4);
}
/*
打印：
p1:0x7ffdc4f00420, p2:0x7ffdc4f00450, p3:0x55c31e81aeb0, p4:0x55c31e81aee0
p1:0x7ffdc4f00420, p2:0x7ffdc4f00450, p3:0x55c31e81aee0, p4:0x55c31e81aee0

p1的地址没有变化，因为不new的和结构体一样是值类型，会完整的拷贝p2的字段信息到p1中来。p3的地址发生了变化，因为p3是指针类型直接拷贝了p4的地址值过来。
*/
```
引用类型，C++中引用类型特指`type &x = y`这种写法，即将&放到类型后面，这可不是取地址，而是特殊语法--引用类型，引用类型的变量名x是y的别名。引用类型常用于函数传参的时候，如果想要修改变量本身可以用引用参数。当然这个功能用指针就可以实现，但是引用类型更加简化了写法。
```c++
void changeValue(int *x){
  *x = 10;
}
void changeValueByRef(int &x){
  // 函数的入参栈上走的代码是 int &x = a; 所以x就是a的别名（本质是指针对吧）
  x = 20;
}
int main(){
  int a = 0;
  int &b = a;
  b = -1;            // b是a的别名，本质也是指针或者说地址，见到b就想象成a就好，这里就是a = -1
  printf("%d\n", a); // -1
  changeValue(&a);
  printf("%d\n", a); // 10
  changeValueByRef(a); // 引用类型的写法更加简单
  printf("%d\n", a); // 20
}
```
如果把changeValueByRef(a); 的栈摊开类似于：
```c++
int a =0;
// changeValueByRef(a);
// ---- 入栈 ----
int &x = a;
x = 20;
// ---- 出栈 ----
printf("%d\n", a); // 20
```
如果本来就是指针类型，再用引用修饰，那就是指针的引用，因为引用本质就是指针，所以引用指针就有双指针的效果，下面探讨指针、引用指针、双指针能实现的效果。
```c++
void changePerson(Person* p1, Person* &p2, Person** p3){
  p1->age ++;
  p2->age ++;
  (*p3)->age ++;
    
}
void changePerson2(Person* p1, Person* &p2, Person** p3){
  p1 = new Person(11, "11"); // 没用
  p2 = new Person(22, "22");
  *p3 = new Person(33, "33");
}
int main()
{
  Person *p1 = new Person(1,"1");
  Person *p2 = new Person(2,"2");
  Person *p3 = new Person(3,"3");
  printf("p1 %p, p2 %p, p3 %p\n", p1, p2, p3);
  changePerson(p1, p2, &p3);
  printf("p1 %p, p2 %p, p3 %p\n", p1, p2, p3);
  printf("p1 %d, p2 %d, p3 %d\n", p1->age, p2->age, p3->age);
  changePerson2(p1, p2, &p3);
  printf("p1 %p, p2 %p, p3 %p\n", p1, p2, p3);
  printf("p1 %d, p2 %d, p3 %d\n", p1->age, p2->age, p3->age);
  //delete(p1);生产环境记得清理内存
}
/*
打印
p1 0x55e9cfc03eb0, p2 0x55e9cfc03ee0, p3 0x55e9cfc03f10
p1 0x55e9cfc03eb0, p2 0x55e9cfc03ee0, p3 0x55e9cfc03f10
p1 2, p2 3, p3 4
p1 0x55e9cfc03eb0, p2 0x55e9cfc04380, p3 0x55e9cfc043b0
p1 2, p2 22, p3 33

对象内部属性的改变，单指针就可以完成，更不用说其他两个
而直接改变指针内的地址，则需要双指针或者指针的引用
*/
```
指针可以完全实现引用的效果，但是引用屏蔽了指针的概念，并且写法更加简洁，引用也为其他语言提供了启发，像go rust等都是没有指针的概念，但是有类似引用的概念的。
# C#
C#借鉴了C++和java的很多用法，算是个集大成者，虽然语法不是越多越好。

C#和C++一样也有struct和对象，struct同样是值类型。例如我们可以这样分别声明struct和class。
```C#
using System;
namespace Demo
{
  struct User
  {
    public int age;
    public String name;
  }
  class Userc
  {
    public int age;
    public String name;
  }
}
```
然后这里体现了他们的区别
```c#
class Program
{
  static void Main(string[] args)
  {
    User u;
    u.age = 10;
    u.name = "frank";

    Userc uc = new Userc();
    uc.age = 10;
    uc.name = "frank";
    
    Change(u);
    Change(uc);
    Console.WriteLine(u.age + "," + uc.age);//10,100
  }
  static void Change(User u)
  {
    u.age = 100;
  }
  static void Change(Userc u)
  {
    u.age = 100;
  }
}
```
C#也有引用传参，在参数上添加ref关键字修饰，例如将上面的Change函数改为
```c#
static void Change(ref User u)
{
  u.age = 100;
}

// 调用时也要加ref
Change(ref u);
// 此时上面运行就打印100,100
```
ref和c++中引用类型的效果一致，c#使用ref避免了直接使用取地址或者指针的方式，就能实现类似的效果了。
# java
java没啥好说的，java没有指针，也没有c#的ref，如果要想改变一个函数外的值类型的值是做不到的。只能搞一些用对象包装的操作达到类似的效果。
```java
int a = 0;
change(a);
System.out.println(a); // a = 10 是做不到的

// 可以用数组包装，实际上是不改变a的地址,只修改了a里的0这个属性的值
int[] a = new int[]{0};
change(a);
System.out.println(a[0]); // 可以做到a = 10
```
java虽然没有指针、引用但是却能完成常用的功能，这其实是很大的优点。因为要记的东西越少越好。
# golang
```
```