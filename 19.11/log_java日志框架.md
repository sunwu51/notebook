# java日志
SLF4j是日志门面api，log4j、log4j2、logback才是真正的日志实现库。
# 各个库单独使用
## 1 log4j
```xml
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
```
classpath下配置文件log4j.properties
```properties
log4j.rootLogger=INFO,console
log4j.appender.console=org.apache.log4j.ConsoleAppender
log4j.appender.console.target=System.out
log4j.appender.console.layout=org.apache.log4j.PatternLayout
log4j.appender.console.layout.ConversionPattern=%d{yyyy-MM-dd HH:mm:ss} [%p] %c: %m%n
```
使用：
```java
import org.apache.log4j.Logger;
...
static final Logger LOGGER = Logger.getLogger(Main.class);
```
## 2 log4j2
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.12.1</version>
</dependency>
```
classpath下log4j2.properties
```properties
rootLogger.level = info
rootLogger.appenderRef.stdout.ref = STDOUT

appender.console.type = Console
appender.console.name = STDOUT
appender.console.layout.type = PatternLayout
appender.console.layout.pattern = %d{yyyy-MM-dd HH:mm:ss} [%p] %c: %m%n
```
```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
...
static final Logger LOGGER = LogManager.getLogger(Main.class);
```
## 3 logback
```xml
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
</dependency>
```
classpath下logback.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="console" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%p] %c: %m%n</pattern>
        </encoder>
    </appender>
    <root level="debug">
        <appender-ref ref="console" />
    </root>
</configuration>
```
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
static final Logger LOGGER = LoggerFactory.getLogger(Main.class);
```
# 各个库实现slf4j标准使用
注意：logback本身就是实现slf4j的，如上代码中的logger本就是slf4j的。

log4j实现方式，引入slf4j-log4j12
```xml
 <dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
</dependency>
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log4j12</artifactId>
    <version>1.7.29</version>
</dependency>
```

log4j2的实现方式，引入log4j-slf4j-impl
```xml
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>2.12.1</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.9.0</version>
</dependency>
```

这样`组装`后就可以用slf4j的写法了
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
...
static final Logger LOGGER = LoggerFactory.getLogger(Main.class);
```
# 多依赖项目的日志统一
事实上，我们的项目可能有很多依赖，各个依赖有可能有着各不相同的日志实现方式。比如我们有五个依赖，他们分别是：
- 独立log4j
- 独立log4j2
- slf化log4j
- slf化log4j2
- slf化logback
因为logback只能slf化，没有独立使用的方式，所以是5种。

而当前我们项目期望使用logback，并期望统一为slf化的logback形式，`只配置一个logback.xml就能对所有依赖进行配置`。以下配置几乎是万能的，当遇到问题的时候，直接全部拷贝进去，稳定解决，绝不复发。
```xml
<!-- 处理单独log4j的依赖： -->
<!-- 用log4j-over-slf4j替换log4j，使依赖中的log4j也能"实现"slf4j-->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>log4j-over-slf4j</artifactId>
    <version>1.7.29</version>
</dependency>
<dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>99.99.99</version>
</dependency>

<!-- 处理单独log4j2的依赖： -->
<!-- 用log4j-to-slf4j替换log4j2，使依赖中的log4j2也能"实现"slf4j -->
 <dependency>
    <groupId>org.apache.logging.log4j</groupId>
     <artifactId>log4j-to-slf4j</artifactId>
    <version>2.12.1</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>99.99.99</version>
</dependency>

<!-- 处理slf化的log4j的依赖: -->
<!-- 因为slf选binding的时候有多个候选,为防止slf4j-log4j12选中,直接去掉他 -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-log4j12</artifactId>
    <version>99.99.99</version>
</dependency>

<!-- 处理slf化的log4j2的依赖: -->
<!-- 因为slf选binding的时候有多个候选,为防止log4j-slf4j-impl选中,直接去掉他 -->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>99.99.99</version>
</dependency>

<!-- 最后引个新版本的logback -->
<dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.3</version>
</dependency>
```
# 小结
- slf4j-log4j12:与log4j联合使用，用于使当前项目的log4j实现slf标准
- log4j-slf4j-impl:与log4j2联合使用，用于使当前项目的log4j实现slf标准
- log4j-over-slf4j:与剔除log4j联合使用，替换log4j，使log4j实现slf。用于让单独用log4j的依赖能遵循slf，进而统一日志配置。
- log4j-to-slf4j:与剔除log4j2联合使用，替换log4j2，使log4j2实现slf。用于让单独用log4j2的依赖能遵循slf，进而统一日志配置。
# 原理
slf4j是门面，大的设计模式是门面系统，而logback是直接实现了slf4j-api中的接口，是通过接口实现的方式完成了门面的实现。

而log4j和log4j2没有直接实现接口，所以需要个适配器。slf4j-log4j12和log4j-slf4j-impl就是`适配器`，将原本不能实现slf4j的变得也能实现这个标准了。添加了适配器后，就能使用slf4j的接口来使用log4j了。
![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/concrete-bindings.png)

项目的依赖中独立使用了log4j/log4j2，注意是依赖中，这时候想要统一到slf4j上来，就需要log4j-over-slf4j/log4j-to-slf4j。
以log4j-over-slf4j为例，他实际上是重写了log4j所有的类，将原来的info、debug等等方法委托给slf4j执行了，上面我们将log4j用不存在版本的方式彻底剔除了log4j中的类，使依赖加载的类被偷梁换柱为log4j-over-slf4j中的logger，这个logger中方法又委托给slf4j，slf4j向下找binding找到仅存的logback。

下面是log4j和log4j-over-slf4j重写的logger类,他们形式上一样包括包名，这里就放一张图了

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/loga.png)

然后都是继承Category这个类，实际上主要的方法实现都在这里，下面分别是log4j包和log4j-over-slf4j包中的Category：

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/logb.png)

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/logc.png)

从图中可以看出log4j就是自己在写日志，而后者则委托给了slf4j。

这是slf官网的图。

![image](https://bolg.obs.cn-north-1.myhuaweicloud.com/1911/legacy.png)

不存在版本的方式剔除log4j是一种暴力方式，其实目的是让原来的log4j不要先加载就行，可以在pom中将log4j-over-slf4j写在log4j前面就行，log4j写存在的版本就行（因为也不会加载）。

疑惑：pom中不写log4j会有问题吗？

回答：可能会有问题。maven决定了依赖的加载顺序，假如用了log4j的依赖叫A。不写log4j在pom中就必须保证log4j-over-slf4j写在A前面。


