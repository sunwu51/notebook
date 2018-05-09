# 设计模式简述1
# 目录
本文是对图解设计模式一书的笔记，按照书本的目录，本篇介绍前五部分。
# 一、适应设计模式
## 1 Iterator 迭代器模式
为了给数组、List、集合等数据集类型的存储结构提供一个统一的遍历方式。这就是Iterator。

一般设计一个`Iterator`的接口（或者直接用java中自带的Iterator接口），并且对要迭代的对象写一个专门的`迭代类`实现这个接口
```java
//---interface Iterator
boolean hasNext()
Object next()

//---class MyArrayIterator implements Iterator
private MyArray myArray
public MyArrayIterator(MyArray myArray){
    this.myArray=myArray;
}
public boolean hasNext(){//判断是否有下一个的具体操作}
public Object next(){//返回下一个的具体操作}
```
如上声明后即可以通过`MyArrayIterator`这个类对MyArray这个类型的对象进行迭代的操作。如果允许修改`MyArray`的话，可以在这个类中添加一个函数如下，这样就可以直接通过对象自己就能拿到迭代器（不用自己new了）
```java
//---class MyArray
...
public Iterator iterator(){
    return new MyArrayIterator(this);
}
```
核心思想：为类添加Iterator，使其可以通过统一的接口(next、hasNext)进行迭代。
## 2 Adapter 适配器模式
原有代码实现了主要的功能了，但是新的接口要求的参数或者返回值和原来代码的函数不太一致。可以通过写个适配器来协调供需。

原来的类--接口1，现在要求---接口2===>一个即实现接口1又实现接口2的类
```java
//---interface i1
String printHH(String s)

//---class c1 implements i1
String printHH(String s){return "H"+s+"H"}

//现在的接口要求
//---interface i2
String printZZHH(String s)

//不要重新写，而是向两头适配
//---class c2 extends c1 implements i2
String printZZHH(){return "Z"+printHH()+"Z"}
```
核心思想：原来开发好的代码和先有的需求并不完全一致，但是大部分代码可利用的情况下。只需要写一个适配器的类，同时满足两头的接口（一般可以继承原来的类，实现现在的接口），这个类中对新接口的方法进行简单的补充就可以适配新需求。
# 二 交给子类
## 3 TemplateMethod模式
将具体的执行操作交给子类，这就是面向对象中`多态特性`的最好体现。即接口或父类中的方法在子类中重写，实际调用的时候执行的是子类中定义的操作。
```java
//---interface i
print()

//---class c1 implements i
print(){sout("c1")}
//---class c2 implements i
print(){sout("c2")}

//调用
i c=new c1();//i c= new c2();
c.print();//打印c1
```
## 4 