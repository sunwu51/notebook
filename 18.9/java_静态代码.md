# tips
静态代码段和普通代码段以及静态变量如下：
```java
public class A{
    static{
        System.out.println("A.static.code");
    }
    {
        System.out.println("A.code");
    }
    static String s = new String("A.static.var")
}
```
执行时机：静态代码块和静态变脸是加载类的时候加载的，而何时加载，普通代码块需要在new创建A对象的时候执行，不过可以执行多次。
# 何时加载类
例如刚才的A类，如果主函数中没有用到A，那A会加载到jvm吗？？

答案当然是不会。

那怎么才算加载呢？
- new A()，因为创建对象所以必须先加载类
- 调用`A.s`使用了A的静态变量，需要先加载类
- 显式加载类A:`Class.forName("A")`
# 特例特例
我们知道上面加载类的第二种情况是使用A中静态变量的时候，会加载类，但是这个静态变量需要是编译期不确定的，比如下面几种情况，就不会加载类，直接能获取该静态变量
```java
//只有这两种：基础类型，字符串非new声明。且必须final。被调用的时候不引起本类的加载
static final int i=10;
static final String s="123";
```
`final`修饰并声明，说明是常量了，以后也不会修改了。int String是基础数据类型和常量字符串，所以会提前存到常量区。

缺少final，或者Integer声明，或者有new 关键字都会导致类的加载。

