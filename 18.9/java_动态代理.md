# java动态代理
# 1 代理
主要目的是想在某个类的方法执行之前注入一些操作。
# 2 静态代理
首先有个接口，和实现这个接口的类：
```java
interface Ihello
    void sayHello()

class Hello implements Ihello
    void sayHello(){sout "hello"}
```
然后有个代理类也实现该接口
```java
class HelloProxy implements Ihello
    Ihello hello
    void sayHello(){sout "before hello"; hello.sayHello}
```
这样一来就可以直接通过这个代理类将原类进行代理了：
```java
// 以前这样调用
Ihello h = new Hello();
h.sayHello(); //打印 hello

// 现在这样代理
Ihello h = new HelloProxy(new Hello());
h.sayHello();//打印before hello hello
```
静态代理要实现接口，不太方便，尤其是一开始不知道要被代理的时候没有写相关接口。不灵活但是执行效率是最高的。
# 3 动态代理
## 3.1 JDK代理
同样需要这样的接口和实现类：
```java
interface Ihello
    void sayHello()

class Hello implements Ihello
    void sayHello(){sout "hello"}
```
然后是重点，实现`InvocationHandler`接口，并在invoke方法中调用method方法，并可以在其前后注入自己想要的操作,这个类不是用来直接调用的，之后会用到。
```java
public class MyHandler<T> implements InvocationHandler {
    T target;
    public MyHandler(T target) {
        this.target = target;
    }
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        sout "hello";
        Object result = method.invoke(target, args);
        return result;
    }
}
```
```java
MyHandler<Ihello> handler = new MyHandler<>(new Hello());
//参数：动态类的加载器，动态类实现的接口(们)，方法执行前的handler
// 第二个参数必须是接口，如果是类会报错
Ihello h = (Ihello)Proxy.newProxyInstance(Ihello.class.getClassLoader(), new Class[]{Ihello.class}, handler);
```
jdk动态代理，会用传入的加载器为我们加载一个新的类`$Proxy0`，这个类
- 继承自`Proxy`类
- 实现了传入的`Ihello`接口
- 在调用所有方法(包括接口中的方法、甚至Obj中的方法)的时候会被handler拦截

这个类的格式大概是长[这样](code/$Proxy0.java)滴.jdk动态代理也有个不太好的地方就是原始类还是要实现一个接口。可能你会问上面的过程中似乎没有用到接口，能不能把接口删掉，然后把用到Ihello的地方改为类Hello呢，这是不可以的，代理类最后要和原始类一样的用，而代理类继承了Proxy所以不能再继承别的类，只能通过和原始类一样，都实现Ihello接口来用。
## 3.2 CGLIB
CGLIB代理可以省去Ihello接口,用刚才的Hello类
```java
class Hello implements Ihello
    void sayHello(){sout "hello"}
```
然后和JDK类似的需要有个拦截器
```java
public class MyMethodInterceptor implements MethodInterceptor {
    @Override
    public Object intercept(Object o, Method method, Object[] objects, MethodProxy methodProxy) throws Throwable {
        System.out.println("cglib before");
        return methodProxy.invokeSuper(o, objects);
    }
}
```
然后就是获得这个代理类了
```java
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(Hello.class);
enhancer.setCallback(new MyMethodInterceptor());
Hello h = (Hello)enhancer.create();

h.sayHello();
```
这里的Enhancer就是增强器，它用于创建代理类，设置代理类的父类（这个父类其实就是要代理的类）和方法的拦截器，这和jdk代理参数类似，jdk里多了个类加载器，jdk传的是接口，这里是类。

cglib最后返回的类，有以下特征
- 继承自原始类`Hello`
- 实现了cglib库中`Factory`接口
- 调用`Hello`父类中可继承的方法，会被拦截

cglib性能好像比jdk的好一点，而且只要原始类，然后自己写一个拦截器类就行了，不需要实现一个接口。新的代理类是继承自原始类的。

这也带来了一些问题，比如原始类如果是`final`的就不能用这种方式代理。原始类中的`final`修饰的方法也就不能被调用了。