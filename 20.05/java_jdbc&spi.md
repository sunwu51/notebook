# 1 spi
java的spi机制，可以在程序运行时，加载接口的多个实现类。可以配合策略模式，来选择具体使用的实现。

jvm中有一个接口和对应的多个实现类，此时在classpath下的META-INF/services创建文件，名称就是接口名，里面是类名
![image](https://i.imgur.com/Ai3R5Wl.png)

此时在运行时通过ServiceLoader可以将这些实现类，全都实例化
```java
public class Main {
    public static void main(String[] args) {
        ServiceLoader<SpiDemo> spiDemos = ServiceLoader.load(SpiDemo.class);
        for (SpiDemo spiDemo: spiDemos){
            spiDemo.hello("nick");
        }
    }
}
/*
impl1 ---nick
impl2 ---nick
*/
```
# 2 jdbc
jdbc使用了spi和打破双亲委派。

其实这是jdk“自作多情”，正常情况下直接用不搞这些也是没问题的。来看下具体细节：
jdbc是jdk中的java.sql包，定义了Driver等多个接口，各个数据库jar实现这些接口。
![image](https://i.imgur.com/jh5xndO.png)

因而本质上就是普通的接口模式开发，所以用最简单的思路就是可以使用jdbc的。
```java
Driver driver = new com.mysql.cj.jdbc.Driver();
Properties properties = new Properties();
properties.put("user","root");
properties.put("password","123456");

Connection conn = driver.connect("jdbc:mysql://127.0.0.1:3306/test",properties);
```

## 2.1 jdbc中维系的DriverList
jdbc中有个`DriverManager`类中的`registeredDriver`(是个list)记录所有注册进来的数据库Driver（至于为啥要记录和怎么记录，后面说）。

注册需要调用registerDriver方法，是各个数据库实现类，自己把自己注册进来。例如mysql的Driver是这样的，都是在静态方法中new一个自己，注册进来。

![image](https://i.imgur.com/MvKFNLq.png)

因为只使用了静态方法，所以经常在以前代码中看到这种写法：
```java
Class.forName("com.mysql.cj.jdbc.Driver");
Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/mysql","root","123456");
```
在jdk1.6之前或者说jdbc4.0之前，只能通过手动的初始化MySQL的Driver类（如上面的new和Class.forName）来实现注册。后面会讲最新的jdbc用到的spi。
## 2.2 getConnection挨个试
上面DriverManager.getConnection方法是在DriverList遍历挨个尝试连接，连不上就试下一个driver，连上了就返回conn。

![image](https://i.imgur.com/P5DS8Bs.png)

## 2.3 jdbc4.0 spi
4.0中使用了spi方式，每个数据库驱动jar包中能找到spi的配置，如mysql：

![image](https://i.imgur.com/slhfTyY.png)

相对的在DriverManager中找到一段静态代码块（DriverManager类加载的时候就会执行）：

![image](https://i.imgur.com/I0VNLcy.png)

这个函数干了两件事情：

第一 通过ServiceLoader把所有配置了DriverSPI的都遍历一下，下图中next函数，看似啥也没干，实际上是new了一个对象。（回顾SPI会调用默认构造方法创建一个实例）而new对象的前提是加载了对象，加载对象的时候就会执行上面说的注册方法。

![image](https://i.imgur.com/iBgDuvg.png)

所以说只要使用DriverManager类的时候，凡是配了spi的这些驱动都会自动注册一个driver实例到DriverList中。所以4.0下也可以直接这样写：
```java
Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/mysql","root","123456");
```
> 简单描述下这一行代码的过程：用到了DriverManager类，所以会加载这个类和运行静态代码块，所以会加载SPI配置的Driver到List中，而mysql是配了的。然后调getConnection方法，这个方法会遍历List挨个尝试，成功了就返回。


第二 为了能加载那些没用spi的jar包(兼容老包)，从jvm启动配置中去拿`sql.Driver`这个配置来进行加载，直接Class.forName加载这些类。

![image](https://i.imgur.com/bK3yDIm.png)

## 2.4 打破双亲委派
上面过程中，DriverManager加载运行静态代码快的时候，加载的Mysql的Driver对吧。这个时候代码在DriverManager中运行，用的是Bootstrap加载器，所以ServiceLoader加载MysqlDriver用的也是Bootstrap，这肯定不行。所以在这一上来改成当前线程上下文的AppClassLoader了。

![image](https://i.imgur.com/RS2HK5R.png)

当然我们之前强调过上下文的CL其实跟到底类加载用什么，没有直接关系，但是ServiceLoader是会利用这个上下文的CL加载的。所以MySQLDriver加载用的APPClassLoader。
