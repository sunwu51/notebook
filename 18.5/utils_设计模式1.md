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
实例：java集合类中大量的Iterator模式
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
实例：InputStreamReader
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
## 4 FactoryMethod模式
在多态的思想下，创建抽象的工厂类和产品类，以及具体的工厂类和产品类去继承前者，这样的效果就是抽象工厂类可以生产各种各样的产品。这也依赖于多态。
```java
//---class Factory
abstract Product create()

//---class Product
void m1()
void m2()

//---class MyFactory extends Factory
Product create(){return new MyProduct();}

//---class MyProduct extends Product
void m1(){...}
void m2(){...}
```
核心思想：在执行过程中的类需要可替换。多态中利用接口可以实现类传入类的可替换。比如我们有一个接口，有一个函数接收这个接口类型的参数。这样我们写这个函数的程序，并不需要已经写好具体实现接口的类。只在调用的时候传入合适的类即可。工厂则是这种思路的延续，只不过传入参数不是产品类，而是工厂类，到里面运行create函数拿到具体类。这样做效果和原来一样。不过工厂不一定只生产一种产品，也就是说可能有createProduct1,2,3,4等等方法。  
实例：spring的FactoryBean
# 三、生成实例
## 5 singleton 单例模式
对于重复使用的工具类，并不需要每次都new，这样带来gc的压力和性能降低。如果只new一次之后一直用这个类，这就是单例的思路。为了强制实现这种思路，有了单例模式。
```java
//懒汉式单例类.在第一次调用的时候实例化自己   
public class Singleton {  
    private Singleton() {}  
    private static Singleton single=null;  
    //静态工厂方法   
    public static synchronized  Singleton getInstance() {  
         if (single == null) {    
             single = new Singleton();  
         }    
        return single;  
    }  
}  
//饿汉式单例类.在类初始化时，已经自行实例化   
public class Singleton1 {  
    private Singleton1() {}  
    private static final Singleton1 single = new Singleton1();  
    //静态工厂方法   
    public static Singleton1 getInstance() {  
        return single;  
    }  
} 
```
实例：spring的bean
## 6 prototype 模式
将`代号（自定义字符串）--一个类的实例`作为键值对保存到一个map中。在使用的时候通过这个字符串代号，将这个对象再拿出来，为了保证每次拿出来一个新的对象用clone方法进行复制。这就是prototype模式。
```java
//---class Manager
private HashMap<String,Product> map = new HashMap()
public void register(String name,Product p){
    map.put(name,p)
}
public Product create(String name){
    return map.get(name).clone();
}

//---interface Product extends Cloneable
void m1()
void m2()

//---class MyProduct1 implements Product
void m1(){...}
void m2(){...}
```
如上在使用的时候用`manager.register("p1",new MyProduct1())`即可注册这个类，在使用的地方通过`manager.create("p1")`即可获得一个MyProduct1类型的实例。注意一般manager为单例的。

核心思想：将满足一定接口(Product)的类的实例注册起来，在使用的时候可以直接注册管理者通过注册的名字获取不同的实例。工厂模式也可以产生满足接口的不同的实例，不过实现的方式不同，工厂要去继承，具体的工厂生产具体的产品们，每个产品都是内部new出来的。原型模式则依赖clone已经注册进来的对象，是对里面属性的一些复制，属性值是注册的值，而不是new的初值。
## 7 builder 模式
建造模式就是有一个包工头设计好了建造图纸：
```java
//---class Director
private Builder b
public Director(Builder b){this.b=b}
public construct(){
    sout("start build");
    b.f1();
    sout("second stage");
    b.f2();
    sout("finish~");
}

//---interface Builder
void f1()
void f2()
//---class MyBuilder implements Builder
public void f1()
public void f2()
```
通过`d = new Director(new MyBuilder())`即可声明一种建造风格的包工头，再`d.construct()`就会按照这种风格建造。

核心思想：也是利用了多态，传入不同的Builder。实际执行会不同。
## 8 abstract factory 抽象工厂模式
# 四、分开考虑
## 9 bridge 桥模式
桥模式就是在河流两岸架起一座桥，这个角度看和适配器有点像。不过适配器是为了适配现在需求的API和老的API，而桥则是为了连接功能扩展和实现。  
功能层次：原来的类增加一些函数，可以继承或委托实现。  
实现层次：原来的类重写原来函数，可以继承或委托实现。  
在功能扩展之后，实现扩展的子类是否也能调用扩展后的方法？
类1继承父类，添加函数，实现功能上的扩展。父类中委托Impl类，执行Impl中的函数，Impl是抽象类叫类2。类3继承类2实现抽象方法。类1是功能层次，类3是实现层次。因为父类通过委托实现的实现层次，所以类1中也是委托给Impl实现的，所以类1将委托的实体设为类3，则同时兼具扩展和实现。
```java
//---class Father
private Impl i
public Father(Impl i){this.i=i}
public void f1(){i.f1()}//注意这里不是继承而是委托

//---abstract class Impl
abstract void f1()

//---class C1 extends Father
public C1(Impl i){super(i)}
public void f2(){i.f1();sout("f2")}
public void f3(){....}

//---class C3 extends Impl
public void f1(){...}
```  
通过`new C1(new C3()).f2()`就可以实现功能层次和实现层次的兼得。  
核心思想：继承重写方法，继承扩展方法，是实现和功能上不同层次的操作。但是两种都通过继承则会导致扩展的方法无法在实现类上使用，因为实现类实现的只是父类接口。此时改变实现层次的方式，不通过继承而是委托。在父类中将函数委托给实现类执行，只有扩展是通过继承。这样扩展类的构造方法也要传入一个实现类，于是这个扩展类就可以传入一个实现类内部调用这个实现类的具体实现方法，又可以调用自己的功能扩展函数。   
## 10 strategy 策略模式
策略一般是算法部分，不同的算法有不同的效果和使用场景。我们可以将策略部分作为一个成员变量放到执行类中。在不同的情况下可以注入不同的策略。从这个角度其实和builder模式是一个意思，就是选不同的建造风格。代码很简单就是一个委托这里就不写了。

核心思想：算法部分抽象成接口，然后可以注入不同的实现类。  
实例：ribbon中算法的替换；JPA中Id的生成方式。
# 五、一致性
## 11 composite 混合模式
为了方便用户，使用户不用关心具体的类型，提供一个高度抽象。如文件和文件夹，可以抽象为条目。用户调用返回值一定是条目，而不用关心具体是啥。即将容器和内容高度抽象成一个事物，保持接口的一致性。
## 12 decorator 装饰模式
装饰模式是对原有类功能的扩展，为了避开继承而使用了委托的方式。使装饰者和原来的类没有强依赖关系，利用多态，一个装饰者可以修饰多个类。
```java
//---interface I1
void print()

//---class C1 implements I1
public void print(){sout('hello')}

//---class Decorator
private I1 i
public Decorator(I1 i){this.i = i}
public void dprint(){
    sout("***");
    i.print();
    sout("***");
}
```
核心思想：利用多态、委托等特性，扩展类的功能。  
实例：javaIO中大量的类都是装饰模式如BufferReader构造函数可以接收任意reader。











