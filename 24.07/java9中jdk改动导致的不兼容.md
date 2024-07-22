---
title: 创建多版本支持的jar包
date: 2024-07-21 21:20:00+8
tags:
    - java
    - 多版本
    - javax
---
# 1 版本兼容的谎言
`java`一直以来有很臃肿的历史包袱，因为他需要兼容老版本，所以有很多设计是放不开手脚的。但是即使这样仍然还是有很多版本的不兼容。

比如这段代码
```java
import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Frank
 * @date 2024/7/21 16:57
 */
@XmlRootElement
public class Main {
    @XmlElement
    int num = 0;

    public static void main(String[] args)throws Exception {
        JAXBContext context = JAXBContext.newInstance(Main.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.marshal(new Main(), System.out); // 输出到控制台
    }
}
```
通过java8运行没问题，但是java9+就会报错。
```bash
# java8 正常运行
$ "C:\Users\sunwu\.jdks\corretto-1.8.0_412\bin\javac.exe" Main.java
$ "C:\Users\sunwu\.jdks\corretto-1.8.0_412\bin\java.exe" Main
<?xml version="1.0" encoding="UTF-8" standalone="yes"?><main><num>0</num></main>

# java11报错，包不存在
$ "C:\Program Files\Eclipse Adoptium\jdk-11.0.17.8-hotspot\bin\javac.exe" Main.java
Main.java:1: 错误: 程序包javax.xml.bind不存在
import javax.xml.bind.JAXBContext;
                     ^
Main.java:2: 错误: 程序包javax.xml.bind不存在
import javax.xml.bind.Marshaller;
                     ^
Main.java:3: 错误: 程序包javax.xml.bind.annotation不存在
import javax.xml.bind.annotation.XmlElement;
                                ^
Main.java:4: 错误: 程序包javax.xml.bind.annotation不存在
import javax.xml.bind.annotation.XmlRootElement;
                                ^
......
9 个错误
```
# 2 javax的迁移
这个问题本质不是java的兼容性导致的，而是`jdk`的改动导致的，`jre11`确实可以完全兼容`java8`代码的运行，但是`jdk11`却不能兼容`jdk8`。

`jdk9`的一些主要变动，围绕`javax`下的几个包展开的：
- `JAXB` xml的序列化和反序列化的包，`javax.xml.bind.XXX`，这个包从jdk移除了，成为一个外部库，需要自己从`maven`下载。
- `JAX-WS` 和`JAXB`有点交集，他是`XML WebScervice`的库，同样成为外部库了。
- `JAVA-EE` 部分功能移除到外部库`Jakarta EE`，例如`javax.servlet`。
- `JAVA-Mail` 移除到外部库，`javax.mail.XX`

下次看到报错`javax.XXX`或者`javax.xml.xxx`，找不到类之类的报错，立马要想到可能是`jdk`版本的原因导致的，这些基本都迁移到`jakarta`外部第三方库下了，如下。
`jakarta`的第三方库，可以从`maven`下载，例如`jakarta.xml.bind-api`，`jakarta.jws-api`，`jakarta.mail`，但是如果用这个库的话，包名不是`javax.XXX`，而是`jakarta.XXX`，所以需要修改代码，下面是几个依赖的例子，具体可以到maven上面去搜，javax或者jakarta关键字，缺少什么搜什么即可。
```xml :pom.xml
<dependencies>
    <!-- JAXB -->
    <dependency>
        <groupId>jakarta.xml.bind</groupId>
        <artifactId>jakarta.xml.bind-api</artifactId>
        <version>4.0.2</version>
    </dependency>
    <dependency>
        <groupId>org.glassfish.jaxb</groupId>
        <artifactId>jaxb-runtime</artifactId>
        <version>4.0.2</version>
    </dependency>
    <!-- JAX-WS -->
    <dependency>
        <groupId>jakarta.jws</groupId>
        <artifactId>jakarta.jws-api</artifactId>
        <version>3.0.0</version>
    </dependency>
    <!-- JavaMail -->
    <dependency>
        <groupId>com.sun.mail</groupId>
        <artifactId>jakarta.mail</artifactId>
        <version>2.0.1</version>
    </dependency>

    <!-- Annotation API-->
    <dependency>
        <groupId>jakarta.annotation</groupId>
        <artifactId>jakarta.annotation-api</artifactId>
        <version>3.0.0</version>
    </dependency>

    <!-- Servlet API -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.1.0</version>
        <scope>provided</scope> <!-- Provided scope，表示在服务器中提供 -->
    </dependency>
</dependencies>
```
上面`JAXB`的例子就要改`import`
```java :Main.java
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Marshaller;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * @author Frank
 * @date 2024/7/21 16:57
 */
@XmlRootElement
public class Main {
    @XmlElement
    int num = 0;

    public static void main(String[] args)throws Exception {
        JAXBContext context = JAXBContext.newInstance(Main.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.marshal(new Main(), System.out); // 输出到控制台
    }
}
```
`jakarta`的包存在两个问题：
- 1 新的版本都是基于`java11`编译，不能在`java8`中引入`jakarta`的包
- 2 包名变了，`javax`->`jakarta`,旧项目改造的话，要改代码。

所以一般通过一些`javax`的第三方库，来兼容`java8`和`java11`的项目，例如`jaxb`要使用`javax`开头的这个包，虽然他提示说已经迁移到`jakarta`了，但是还是得用`javax`兼容。

![img](https://i.imgur.com/FsDqYwO.png)

用这样两个版本，这俩库会间接依赖，把一共7个jar包引入进来。
```xml :pom.xml
<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.1</version>
</dependency>
<dependency>
    <groupId>org.glassfish.jaxb</groupId>
    <artifactId>jaxb-runtime</artifactId>
    <version>2.3.1</version>
</dependency>
```
# 3 tools.jar
`tools.jar`是`jdk`自带的jar包，里面包含了一些工具类，很多工具中都会使用`tools.jar`，然而在`java8`以及之前的版本，`tools.jar`是`jdk的lib`目录下，如果要使用，需要自己手动引入该jar包。`java9`之后，`tools.jar`被移除，整合到`jre`环境中了

这是java8的目录结构：
```
jdk8/
├── bin/
├── lib/
│   ├── tools.jar
│   └── ...
├── jre/  // 包含 Java 运行环境
│   ├── bin/
│   └── lib/
└── ...
```

![img](https://i.imgur.com/bhG0N3m.png)

![img](https://i.imgur.com/1zapZqa.png)

这是java11的目录结构：
```
jdk11/
├── bin/
├── lib/
│   ├── jrt-fs.jar
│   ├── ...
├── jmods/  // 新增的目录，.jmod文件包含模块信息
└── ...
```
jdk的各种模块，class文件等，都是放到了`jmod`格式的文件中，这个文件以模块名命名，包含了模块的所有信息，例如模块的依赖，模块的class文件等。而`tools`相关的也被放到`jdk.attach`等几个模块中了。

![img](https://i.imgur.com/xzs2LpR.png)

知道了这些背景之后呢，就引出了一个问题，如果我们项目中使用到了`tools.jar`，如何兼容`java8`和`java11`呢？

如果只是`java9+`，那么不需要引入任何依赖，但是要判断是`jdk`而非`jre`即可，代码如下，这里`java.lang.module`是java9之后才有的，所以只能用java9+进行编译。
```java
import java.lang.module.ModuleFinder;
import java.lang.module.ModuleReference;
import java.util.Optional;

Optional<ModuleReference> moduleReference = ModuleFinder.ofSystem()
                .find("jdk.attach");
if (moduleReference.isPresent()) {
    System.out.println("当前环境包含jdk.attach模块，是jdk环境");
} else {
    System.out.println("当前非jdk环境");
}
```
另一种更简单的判断方式，是直接看类存不存在
```java
try {
    Class.forName("javax.tools.ToolProvider");
    System.out.println("当前环境是 JDK");
} catch (ClassNotFoundException e) {
    System.out.println("当前环境是 JRE");
}
```

如果是java8环境，那么就需要自行引入`tools.jar`,在代码编写阶段，需要在pom依赖中，这样写，来手动引入。
```xml
<dependency>
	<groupId>com.sun</groupId>
	<artifactId>tools</artifactId>
	<version>1.8</version>
	<scope>system</scope>
	<systemPath>${JAVA_HOME}/lib/tools.jar</systemPath>
</dependency>
```
但在运行时，不会一起打包，所以运行时还需要自己把`tools.jar`放到cp中。
```bash
$ java -cp /path/to/tools.jar:app.jar Main
```

编写代码时，都好说，代码中使用`tools.jar/jdk.attach`，然后在不同的java环境下都能简单的用`java -jar app.jar`来运行，如何实现。编写的java版本只能是低版本，所以选择java8来编写。

思路是：`main`方法启动的时候，就判断当前的java版本，如果是`java9+`，并且是`jdk`环境，则直接继续运行；如果是`java8`,则需要动态加载`tools.jar`，然后运行，动态加载的方式是新建一个`ClassLoader`，来同时加载`tools.jar`和当前的类，重新加载当前类，并运行`main`方法。
```java
public class Main {
    public static void main(String[] args) throws Exception {
        if (javaVersion() < 9) {
            // 用自定义类加载器，加载tools.jar 然后重新运行main方法
            if (!Main.class.getClassLoader().toString().startsWith("ToolsClassLoader")) {
                ToolsClassLoader toolsClassLoader = new ToolsClassLoader(
                    new URL[]{toolsJarUrl(), currentUrl()},
                        ClassLoader.getSystemClassLoader().getParent()
                );
                Class<?> mainClass = Class.forName(Main.class.getName(), true, toolsClassLoader);
                Method mainMethod = mainClass.getMethod("main", String[].class);
                mainMethod.invoke(null, (Object) args);
                return;
            }
        }
        if (!toolsLoaded()) {
            throw new RuntimeException("tools.jar not loaded, make sure jdk env is used");
        }
        //....继续运行即可
    }
    public static int javaVersion() {
        String v = System.getProperty("java.version");
        // 1.8以下是1.开头的
        if (v.startsWith("1.")) {
            return Integer.parseInt(v.substring(2, 3));
        }
        // 9以上就是数字本身了
        return v.split("\\.")[0];
    }
    public static boolean toolsLoaded() {
        try {
            Class.forName("javax.tools.ToolProvider");
            return true;
        } catch (ClassNotFoundException e) {
            return false;
        }
    }
    
    private static URL toolsJarUrl() throws Exception {
        String javaHome = System.getProperty("java.home");
        File toolsJarFile = new File(javaHome, "../lib/tools.jar");
        if (!toolsJarFile.exists()) {
            throw new Exception("tools.jar not found at: " + toolsJarFile.getPath());
        }
        URL toolsJarUrl = toolsJarFile.toURI().toURL();
        return toolsJarUrl;
    }

    private static URL currentUrl() throws Exception {
        ProtectionDomain domain = Attach.class.getProtectionDomain();
        CodeSource codeSource = domain.getCodeSource();
        return codeSource.getLocation();
    }
    
    public static class ToolsClassLoader extends URLClassLoader {
        public static String namePrefix = "ToolsClassLoader";

        public ToolsClassLoader(URL[] urls, ClassLoader parent) {
            super(urls, parent);
        }

        public String toString() {
            return namePrefix + ":" + super.toString();
        }
    }
}
```
# 4 多版本jar包
因为jdk升级导致的一些不兼容，在高版本和低版本的写法可能是不一样的，就像上面的`tools.jar`中类的应用，但是上面情况比较友好的类名没有变化。如果是`java8`和`java9`中的用法完全不同，那么就需要写两个版本的jar包，一个是`java8`的，一个是`java9`的，就很复杂，所以就有了多版本jar包。即在一个jar包中，塞入java8和java9的class文件，然后在运行阶段，自动根据java版本，加载不同的版本目录下的class文件。

jackson这个常用的库为例，他的`META-INF`目录下，有`version.9`目录，就是当java的运行时环境是`9+`的时候，会自动加载`version.9`目录下的class文件，这里只有`module-info.class`，其实就是当`9+`的时候，自己会作为一个模块，很多第三方库为兼容老版java和新的模块化特性都会这么做。

![img](https://i.imgur.com/HHEQKdz.png)
