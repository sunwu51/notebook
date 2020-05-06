# 类加载
# 1 什么时候加载
类加载是惰性的，如果我们没用用到类，这个类就不会加载。如果类中有静态变量则会直接加载，如果new对象也会开始加载。
# 2 谁加载
类加载器。

BootstrapLoader加载rt包下的一些jdk基础的类，在启动的时候需要的很多类都是这里面的，他们由BootstrapLoader加载。

ExtClassLoader加载一些扩展类，例如ext包下的一些类是他加载的。

AppClassLoader加载classpath下各种用户类，入口main函数所在的类就是用户类，是由AppClassLoader加载。

三者为父子关系，但是Boot是Ext的父，Ext是App的父。原则上当前类中加载的对象，会优先用当前类的类加载器尝试加载。例如
```java
class A{
    void test(){
        B b = new B();
        String c = new String();
    }
}
```
上面的用户类B的加载器是跟A类的加载器一样的，而rt类String的类加载器会先尝试A的类加载器，根据双亲委派最终用BootStrapLoader加载好的String类。
## 2.1 双亲委派
通俗讲，就是要加载类的时候找到了类加载器，但是不是立即用这个加载器加载。而是先判断当前类加载器的父类加载器是否加载过这个类，如果已经加载过了则直接返回父类加载器加载好的类对象，否则才用当前类加载器加载。

例如上面的B，先找到AppCL，找父Ext，未加载，找父Boot，未加载，最终决定由AppCL来加载。再比如上面的String，先找AppCL，找父Ext，未加载，找父Boot，String是rt中的类已经由Boot加载。所以直接返回的这个AppCL加载过的String类对象。即这里c这个对象的对象头中Klass指针，指向的Klass是Boot加载好的String对应的Klass。
# 3 怎么加载
加载class文件字节码->连接(验证、准备、解析)->初始化->[使用->卸载]。

主要涉及Metaspace部分，一个ClassLoader对应一部分Metaspace中的内存，这部分来放置类的元数据，例如Klass，itable，vtable等。当新的类加载的时候Metaspace就会变大，而当这个类加载器加载的所有对象和Class对象都被gc掉之后，也会将Metaspace清理，这个过程也是类卸载的过程。
# 4 应用场景
利用自定义类加载器解决冲突问题，之前讲过，参考这个[项目](https://github.com/sunwu51/ClassloaderDemo)，这也是阿里的Pandora容器干的事情。




