---
title: java9模块化JPMS的坑
date: 2024-07-21 15:00:00+8
tags:
    - java
    - JPMS
    - 模块化
---
# 模块概念
java9引入了模块系统（`Java Platform Module System, JPMS`），旨在增强 Java 的封装性、可维护性和可扩展性，模块是`package`的`package`，作用主要是声明哪些是公开的包，哪些是自己模块内部用的，防止引入不必要的依赖，这样可以便于大型应用的管理，减少不同模块之间的干扰。

# 模块使用
模块的管理是通过`module-info.java`文件来管理的，这个文件是模块的入口，里面声明了模块的名称，依赖的模块，以及暴露的包，下面项目使用java11。

正常情况下，我们创建一个maven项目，然后添加两个`maven module`，分别是`mod1`和`mod2`，其中`mod1`引入`mod2`，此时能够使用`mod2`中的`User`和`InnerUtils`类，这就是没有`JPMS`的时候，

![img](https://i.imgur.com/8SInCbk.png)

`InnerUtils`是`mod2`中的内部类，所以`mod1`中不应该直接使用。添加`module-info.java`文件，到`mod2`的`java`文件夹下。

![img](https://i.imgur.com/EQGT2qs.png)

在`mod2`包的根目录下创建的`module-info.java`如下，这里演示了最主要的三个部分，`module`是模块名不需要是包名，可以任意命名，但最好还是和包名类似的规范，`requires`表示依赖的模块，`exports`表示暴露的包。
```java
module my.mod2 {
    requires java.base; // java.base是默认都引入的，可以不写
    exports org.example.mod2;
}
```

然后在`mod1`中同样声明模块，引入`my.mod2`
```java
module my.mod1 {
    requires my.mod2;
}
```
引入没有`exports org.example.mod2.utils`这个包，所以此时报错。

![img](https://i.imgur.com/NpU3eML.png)

除了基本的`requires` `exports`引入和导出，其他语法如下。
- `opens` 允许反射访问（私有属性方法）
- `requires transitive` 同时也会引入依赖的依赖
- `requires static` 仅在编译阶段需要引入的依赖
- `uses`和`provides`与`spi`机制类似，`uses`表示使用服务，`provides`表示提供服务

# uses与provides
先说`SPI，Service Provider Interface`机制，这是一个很早的机制，只需要在`META-INF/services`目录下创建一个文件，文件名是接口的全限定名，文件内容是实现类的全限定名，就可以使用`ServiceLoader.load`加载该实例。

例如在`mysql-connector-java`中，`META-INF/services/java.sql.Driver`文件内容是`com.mysql.cj.jdbc.Driver`，这样就可以使用`ServiceLoader.load`加载该实例，这也是`jdbc driver`的加载机制，利用spi的机制，在`classpath`目录下扫描所有的`META-INF/services/java.sql.Driver`文件，找到里面的声明的类名，然后用`AppClassLoader`加载该类，并实例化。

![img](https://i.imgur.com/j8w68RI.png)

如果采用JPMS组织模块，则`ServiceLoader.load`方法，不再能扫描真个`classpath`，而是只能扫描自己`uses`的接口。我们以`Runnable`接口为例。

```java
// mod2的module-info.java
import org.example.mod2.MyRunnable;
module my.mod2 {
    provides Runnable with MyRunnable;
}

// mod1的module-info.java
module my.mod1 {
    uses Runnable;
    requires my.mod2;
}
```
此时在`mod1`中可以使用`ServiceLoader`加载`mod2`中的`MyRunnable`类。
```java
ServiceLoader<Runnable> loader = ServiceLoader.load(Runnable.class);
for (Runnable runnable : loader) {
    runnable.run();
}
```
这使得`mod2`中的`MyRunnable`类，可以被`mod1`中的`ServiceLoader`加载，但`mod1`中不能直接使用`MyRunnable`类，因为`mod2`中没有`exports`。

# opens与反射
在上面的例子中，只提供了`provides`没有提供`exports`会导致，类无法访问，例如，改为反射调用会报错。
```java
ServiceLoader<Runnable> loader = ServiceLoader.load(Runnable.class);

for (Runnable runnable : loader) {
    Method m = runnable.getClass().getDeclaredMethod("run");
    m.invoke(runnable);
}
// class org.example.mod1.Main (in module my.mod1) cannot access class org.example.mod2.MyRunnable (in module my.mod2) because module my.mod2 does not export org.example.mod2 to module my.mod1
```
此时只需要修改`mod2`，即可正常反射调用。
```diff
import org.example.mod2.MyRunnable;
module my.mod2 {
    provides Runnable with MyRunnable;
+   exports org.example.mod2;
}
```
而`opens`指的一般是`private`的属性方法，例如`MyRunnable`中有个`private void inner`方法。
```java
// mod1中直接反射调用mod2的private方法
Method inner = MyRunnable.class.getDeclaredMethod("inner");
inner.setAccessible(true);// 这一行会报错如下：

// Exception in thread "main" java.lang.reflect.InaccessibleObjectException: Unable to make private void org.example.mod2.MyRunnable.inner() accessible: module my.mod2 does not "opens org.example.mod2" to module my.mod1
```
上面报错是因为没有给`mod1`中开放反射权限，需要修改`mod2`，添加`opens`。
```java {5,6}
import org.example.mod2.MyRunnable;
module my.mod2 {
    provides Runnable with MyRunnable;
    exports org.example.mod2;
    opens org.example.mod2;
    // opens org.example.mod2 to my.mod1; 这是只暴露给mod1的语法
}
```
# 反射坑
在`java9-15`中，即使非`模块化`项目，也就是即使没有`module-info`，使用反射调用`private`方法属性的时候，也会有警告信息如下。

![img](https://i.imgur.com/y9tHh0P.png)

`--illegal-access=permit`这是默认的配置，即非法反射会有警告信息打印，其实还好，只是会打印警告信息，不会报错。但是如果使用`--illegal-access=deny`，则会报错。而`java16+`中就是改成了`deny`，我们改成`java17`再次运行。

![img](https://i.imgur.com/kRtWhJW.png)

这里报错信息也很清楚，就是没有把`java.lang`包open给我们的匿名模块，这里解释下`java.base`模块，这个是包含了`java.lang/java.io`等等一众基础的jdk的包的模块名，他没有open给我们的模块，意味着我们是不能直接反射调用的。并且第一行表示`java17`中`--illegal-access=warn; support was removed in 17.0`，没法修改这个标志位了，只能挂。解决方法是设置另一个java运行标志，如下，`java.base`模块开放给我们的UNNAMED模块，这样就可以正常反射调用了。
```bash
java --add-opens java.base/java.lang=ALL-UNNAMED \
     --add-opens java.base/java.util=ALL-UNNAMED \
     --add-opens java.base/java.io=ALL-UNNAMED \
     --add-opens java.base/java.nio=ALL-UNNAMED \
     --add-opens java.base/java.security=ALL-UNNAMED \
     --add-opens java.base/java.net=ALL-UNNAMED \
     --add-opens java.base/java.time=ALL-UNNAMED \
     -jar your-app.jar
```

小结一下：
- 模块化的项目，本来就无法反射`java.base`中的私有方法来调用
- 非模块化的项目，如果`--illegal-access=deny`，也会报错
- `java9-15`中，只是警告，不会报错，但是`16+`是`deny`了

# 不修改jvm参数调用defineClass
`JPMS`对老的`java8-`的项目升级带来了一些障碍，对于新的项目来说是没问题的，按照`JPMS`的规范，可以直接使用`module-info.java`，但是对于老的项目，如果直接升级，可能就有问题。首先老的项目所有的包都是`UNNAME`模块下的，本身不受`requires`和`exports`的约束，所以问题主要集中在`opens`反射。而java9-15只是警告，不报错也还好，但是如果要升级`java17`可能很多项目都会遇到上述问题。

例如`Mockito`框架就会报错
```java
@RunWith(MockitoJUnitRunner.class)
public class MainTest {
    @Mock
    Object anything;

    @Test
    public void test() {
        System.out.println("test");
    }
}
```

![img](https://i.imgur.com/dRsxREg.png)

还有一些`cglib`、`javassist`等库也会报错，与上面报错类似，基本都是因为`ClassLoader#define`这个方法是`protected`，而非`public`反射无法访问导致的，我自己刚好也写了一个字节码工具，也需要自己根据`byte[]`加载成`Class`，这个`defineClass`方法是jvm类加载的方法。

这里介绍我是如何绕开反射机制来运行`defineClass`方法的，借助`defineClass`方法是`protected`，所以继承`ClassLoader`，就可以在自己的`ClassLoader`中访问`defineClass`方法了，但是最终效果与直接用指定加载器加载类不同，是通过一个子加载器加载的类，只不过这个类运行时，他用到的其他类，都会用其父类加载器。
```java
public static class MyClassLoader extends ClassLoader {
    final byte[] bytes;
    final String className;
    public MyClassLoader(ClassLoader parent, byte[] data, String className) {
        super(parent);
        this.bytes = data;
        this.className = className;
    }

    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        // 不是指定的类名，用父类加载器加载
        if (!className.equals(name)) {
            return super.loadClass(name);
        }
        // 指定类名，用当前类加载器加载指定的字节码
        return defineClass(name, bytes, 0, bytes.length);
    }
}
```

`loadClass` `findClass`和`defineClass`的区别：
- `loadClass`：加载类，`public`，如果类已经加载过，则直接返回，没有加载过，则递归调用`parent.loadClass`，父加载器没有返回结果或抛出异常，则最后调用`findClass`，注意父加载器中也会挨着调用`findClass`。
- `findClass`：查找类，`procted`。默认实现是抛出`ClassNotFoundException`，子类可以重写这个方法，一般是在`findClass`中去找到文件，读取字节码，调用`defineClass`
- `defineClass`：定义类，涉及native方法，最底层的类加载的步骤，一般在`findClass`中调用。

我们上面的例子是直接在`loadClass`中调用`defineClass`，而不是在`findClass`中调用，这里结果上应该是一致的，但放到`loadClass`中可以直接跳过到`parent`中递归load的过程，直接就用当前的`ClassLoader`加载了，可以避免万一在`parent`中确实加载过同名的`class`。