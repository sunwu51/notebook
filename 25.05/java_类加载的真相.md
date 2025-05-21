---
title: java_类加载的真相
date: 2025-05-18 13:58:02+8
tags:
    - java
    - classloader
---
# 背景
类加载就是把`class`文件加载到jvm中，加载过程是需要加载器的，`jvm`中不止一个加载器来进行加载，主要有三种加载器，`Bootstrap ClassLoader`，`Extension ClassLoader`，`App ClassLoader`分别来加载`jre`中的类，扩展类，用户类。

类加载器+类名，可以唯一确定`jvm`中的一个类，即`Class`对象，如果这个类已经存在了那么会直接返回，不会再读取一遍`class`文件，这样可以提高效率很合理。不同的类加载器，主要是为了区分不同的`class`文件的位置，比如`Bootstrap ClassLoader`主要是加载`jdk`的核心类的目录下的`class`文件，`Extension ClassLoader`主要是加载`jdk`的扩展目录下的`class`文件，`App ClassLoader`主要是加载`classpath`下的`class`文件。

为了防止用户自己定义的类与`jdk`的类冲突，所以`java`类加载机制采用了双亲委派模型。这个模型我们也可以叫他委托模型，即`ClassLoader`会先尝试委托给父类加载器即`this.parent`，如果父类加载器无法加载，那么才会自己加载。这样如果我们的`classpath`下定义一个`java.lang.String`，我们使用的时候，会用`App ClassLoader`去加载，此时`App ClassLoader`会委托给`Ext ClassLoader`去加载，`Ext ClassLoader`会委托给`Bootstrap ClassLoader`去加载，后者加载成功，就直接返回了，返回的`String`是在`jdk`目录的，而不是`classpath`下的。这样就很好的保护了核心类，防止被篡改。

这里有两个疑问：
- `jvm`如何实现一个类加载器+类名，唯一确定的类，只会加载一次，后续会用缓存，不会重复加载的呢？
- `jvm`如何实现的先让`parent`进行加载，失败后自己再加载呢？

![image](https://i.imgur.com/pOLfFoE.png)

上图是抽象类，`ClassLoader`类中最重要的方法`loadClass`的默认实现，流程就是先从缓存中找到自己是否已经加载过这个类`findLoadedClass`方法，如果没有的话，会看`this.parent.loadClass`是否成功。如果没有`parent`的话，默认的`parent`其实是`BootStrapClassLoader`。如果也没有记载成功，则会调用自身的`findClass`方法，这个方法默认是空的，需要子类去实现。
# URLClassLoader
最常见的`ClassLoader`的实现类就是`URLClassLoader`，因为类加载器主要是用来区分不同的`class`文件加载路径的，`URLClassLoader`就是指定特定的`URL`路径去加载的，`App ClassLoader`就是`URLClassLoader`的子类。例如`new URLClassLoader(new URL[]{new URL("file:/D:/test.jar")})`就可以加载`D:/test.jar`中的`class`文件了。在`URLClassLoader`中，`findClass`就是逐个从`URL`路径中寻找有没有对应的`class`文件。

![image](https://i.imgur.com/pONB5KL.png)

找到这个文件后，会将其读取到内存中，最终调用`native`方法`defineClass`来定义这个`class`文件，并返回`Class`对象。

如果一个`URLClassLoader`下有多个`URL`，比如指定了两个jar包，里面都含有`com.test.A`类的话，会按照`URL`的优先级来进行加载，优先级高的jar包会覆盖优先级低的jar包。所以在`URLClassLoader`中有`findResource`和`findResources`两个方法，前者是找到优先级最高的生效的资源，后者则是如果有多个资源，则返回多个资源。与`loadClass`类似的`ClassLoader`中也有个`getResource`方法，也是委托的方式来实现的。

![image](https://i.imgur.com/RqZW56H.png)

通俗讲`findResource/findClass`就是当前加载器自身的`scope`范围内去找，`getResource/loadClass`默认是要先委托给`parent`去找。
# 解决jdk8 tools问题
接下来我会以几个我的项目中使用类加载器的例子，来展示如何利用类加载器机制来解决问题。`jdk8`中`tools`包是没有被默认引入的，如果要想使用`jdk`目录下的`tools.jar`中的类，则需要自行引入。一种比较丑陋的引入方式，是直接把`tools`打包到自己的项目的jar包中，但是这个方案也有较大的问题，因为不同的平台的`tools`是不同的，所以需要根据不同的平台引入不同的`tools`包，另外不同版本的`jdk`也是不同的情况。甚至`jdk9`之后`tools`包被默认加到了`rt`中，不需要单独引入了。

所以最好的方式是，先判断`tools`是否被正常加载了，如果没有的话，则从`java_home/lib/tools.jar`下手动加载。
```java :Attach.java
// 判断当前类加载器是否是自定义的WClassLoader
if (!Attach.class.getClassLoader().toString().startsWith(WClassLoader.class.getName())) {
    // 如果不是的话，则检查jdk版本是否是1.8
    String jdkVersion = System.getProperty("java.version");
    if (jdkVersion.startsWith("1.")) {
        if (jdkVersion.startsWith("1.8")) {
            try {
                // 如果是1.8则用自定义的类加载器加载当前类
                // 这个类加载器中会指定当前jar包路径 + tools.jar路径
                // parent指向AppClassLoader的parent，即ext classloader
                // 这样与原来的loader对齐
                WClassLoader customClassLoader = new WClassLoader(
                        new URL[]{toolsJarUrl(), currentUrl()},
                        ClassLoader.getSystemClassLoader().getParent()
                );
                // 重新用WClassLoader加载当前类
                Class<?> mainClass = Class.forName("w.Attach", true, customClassLoader);
                Method mainMethod = mainClass.getMethod("main", String[].class);
                // 并运行main方法，此时会重新进入到这段代码，但是第一行的判断
                // 就是由WClassLoader加载的，会跳过这段
                mainMethod.invoke(null, (Object) args);
                return;
            } catch (Exception e) {
                e.printStackTrace();
                System.exit(-1);
            }
        } else {
            Global.error(jdkVersion + " is not supported");
            return;
        }
    }
}
// 这里可以使用tools中的类了
List<VirtualMachineDescriptor> jps = VirtualMachine.list();
```
思考一下上面代码，为什么不能直接换成：
```java
if (javaVersion.startsWith("1.8")) {
    // urlClassLoader来加载tools.jar
    URLClassLoader urlClassLoader = new URLClassLoader(
        new URL[]{toolsJarURL()}
    );
}
List<VirtualMachineDescriptor> jps = VirtualMachine.list();
```
这样肯定是不行的，有一条很重要的定律：当前类的函数中，用到的其他类，都是由当前类的加载器来加载的。所以上面`VirtualMachineDescriptor`这个类是用`Attach`这个类的类加载器即`App classloader`去加载的，不会用自定义的`urlClassLoader`，因而我们需要用前面重新加载类，并重新调用`main`方法的方式。
# 用Spring的classloader运行自定义代码
小工具使用`attch`的方式，注入到宿主jvm进程，并且希望传入一段代码来进行运行。传入的代码可以用一些编译框架把源码编译成字节码`byte[]`，然后再由类加载器将字节码加载成类，并调用特定的方法就可以了。

但是类加载需要用`spring`的`classloader`，以便于访问项目中的类，因为`spring`并没有使用默认的`AppClassLoader`，而是使用`spring`的`classloader`，叫做`LaunchedURLClassLoader`，这是因为`spring boot`独特的打包方式导致的，会将所有的依赖都打包到`jar`包中，并且不是`shade`那种把所有依赖的`jar`中的`class`都解压出来拷贝到新的`jar`包，而是直接将所有的依赖的`jar`，直接塞到最终的`jar`包中。如下图，`BOOT-INF`目录是我们自己项目的`class`放到`classes`目录，以及我们依赖的`jar`放到了`lib`目录。

![image](https://i.imgur.com/0KUs2vZ.png)

![image](https://i.imgur.com/ZzQ0dAe.png)

而`spring`实现了特殊的类加载方式，可以加载`jar`中的`jar`，并且`URL`目录是`xx.jar!/BOOT-INF`。

上面是背景，回归正题，`attach`的时候的类加载器是`AppClassLoader`，是无法访问到`SpringBoot`加载器目录下的这些类的，怎么办？

直接用`LaunchedURLClassLoader`来`loadClass`我们的编译工具得到的`byte[]`，是不行的，因为`ClassLoader`并没有一个`public`的load byte[]的方法（`defineClass`是`protected`）。这里的解决方式是，通过自定义一个`ClassLoader`，指定`parent`为`LaunchedURLClassLoader`，然后重写`loadClass`方法，判断是`w.Exec`这个类，那么就调用`defineClass`加载对应的`byte[]`，这样就可以调用`protected`的`defineClass`方法了。

```java :ExecClassLoader
class ExecClassLoader extends ClassLoader {
    public ExecClassLoader(ClassLoader parent) {
        super(parent);
    }
    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        if (!name.equals(EXEC_CLASS)) {
            return super.loadClass(name);
        }
        try {
            byte[] bytes = WCompiler.compileWholeClass("package w; public class Exec { public void exec() {} }");
            return defineClass(EXEC_CLASS, bytes, 0, bytes.length);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```
然后使用这个新的类加载器加载`w.Exec`这个“虚空”类，并反射调用exec方法。
```java
Class<?> c = new ExecClassLoader(springClassLoader()).loadClass("w.Exec");
Object inst = c.newInstance();
inst.getClass().getDeclaredMethod("exec").invoke(inst);
```
# 解决jackson问题
`swapper`中有json序列化需求，引入了`jackson`库。这会导致如果宿主`jar`也使用了`jackson`会导致两种情况：
- 如果非`spring fat jar`，那用户类和`swapper`都是`AppClassLoader`加载的，只能有一个`jackson`的类生效的，如果版本存在冲突，可能导致应用崩溃。
- 如果是`spring jar`，那初次加载，`LaunchedURLClassLoader`会委派给`AppClassLoader`导致使用的`swapper`中依赖的`jackson`，项目如果不兼容这个版本就崩溃了。当然还有可能是项目已经加载过`jackson`后，我们又attach的，这种情况，倒是不会有冲突，因为已经项目加载过，会用缓存中正确的结果，而`swapper`中，则使用`AppCl`能加载到的位置，就只有自己内部的`jackson`。

对于这个问题，最简单的解决方案就是，直接把`swapper`中`shade`打包的时候，把`jackson`的包名改了。
```xml :pom.xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-shade-plugin</artifactId>
	<version>3.5.0</version>
	<configuration>
		<relocations>
			<relocation>
				<pattern>com.fasterxml.jackson</pattern>
				<shadedPattern>wshade.com.fasterxml.jackson</shadedPattern>
			</relocation>
		</relocations>
	</configuration>
	<executions>
		<execution>
			<phase>package</phase>
			<goals>
				<goal>shade</goal>
			</goals>
		</execution>
	</executions>
</plugin>
```
但是这个改完，不见得完事大吉，对于改包名的，尤其要关注是否有影响`SPI`。例如为了支持`java.time`的序列化，我们还引入了`jsr310`这个依赖，他里面使用了`SPI`的机制来注册自身作为`jackson`的`Module`，因为我们把类名改了，所以现在是`wshade.com.xxx.Module`了。

![image](https://i.imgur.com/et1zlc1.png)

这里就需要自己加一个`SPI`的配置在项目中。

![image](https://i.imgur.com/HxQDYkG.png)
# 注入Groovy REPL
`attach`后还希望注入一个`groovy`的repl来执行`groovy`代码，与`Exec`类似，都是运行一段自定义代码，但是不同的是`Exec`是一个简单的自定义类，直接用`ClassLoader#defineClass`就加载了。而`groovy`是一些复杂的依赖jar组成的。我们就没办法简单的用`ExecClassLoader`来创建`GroovyEngineImpl`类了，就需要用`URLClassLoader`到特定的目录下去加载`groovy.jar`了。

## 方案一
一种比较实用的思路，就是首先和`jackson`的思路一样，修改了`groovy`的包名，然后把各种`SPI`的文件名都给更新了。这样在`swapper`中使用的`GroovyEngineImpl`就是新的包名，不会和宿主jar包中的`groovy`冲突。

然后为了能访问`spring`项目中的类，需要把`GroovyEngineImpl`的加载器指向`springClassLoder`
```java
GroovyScriptEngineImpl engine = 
    new GroovyScriptEngineImpl(new GroovyClassLoader(springClassLoader()));
```

![image](https://i.imgur.com/t2pYg8R.png)

这个方案需要把以上6个包名都重写，并且还有个比较麻烦的事情，是`groovy`中有较多指定的字符串变量作为`URL`来加载`resource`的，比如

![image](https://i.imgur.com/W5KWpvG.png)

这种就不太好直接改`groovy`这个文件中的字符串的值了，所以这个方案成本有点高。
## 方案二
另一种妥协的方案，是不修改包名，指定特定的类加载器来加载`GroovyScriptEngineImpl`
```java :WGroovyClassLoader.java
class WGroovyClassLoader extends URLClassLoader {
    public WGroovyClassLoader(ClassLoader parent) throws Exception {
        super(new URL[] { currentUrl() }, parent);
    }
    @Override
    public Class<?> loadClass(String name) throws ClassNotFoundException {
        if (name.startsWith("org.apache.groovy") || name.startsWith("org.codehaus.groovy") || name.startsWith("groovy") || name.startsWith("w.core.GroovyBundle")) {
            Class<?> c = findLoadedClass(name);
            if (c != null) return c;
            return findClass(name);
        }
        return super.loadClass(name);
    }
}
```
注意看这个类加载器，继承`URLClassLoader`并且指定了`url`为只从`swapper.jar`加载，这里的`parent`会指定为`springClassLoader`。

这是目前的`ClassLoader`与对应的`Resource`资源。

![image](https://i.imgur.com/7C9qOfq.png)

这里`WGroovyClassLoader`与其他不同，他的`loadClass`方法是自定义的加载顺序，并不是按照默认的双亲委派机制，而是`groovy`相关的类，直接用`findClass`在自己的`resource`下寻找并加载，而其他的类，则完全委托给`parent`加载。

这样，`groovy`相关的包，都从`swapper.jar`中找，其他的都从`springCl`，`swapper`中的其他类，则是`springCl`再向上委托给`AppCl`加载的。

代码中，同样也需要更换类加载器，反射重新调用自己，的过程。
```java
{
    static WGroovyClassLoader cl;
    static GroovyScriptEngineImpl engine;
    static {
        if (GroovyBundle.class.getClassLoader().toString().startsWith(WGroovyClassLoader.class.getName())) {
            try {
                engine = new GroovyScriptEngineImpl(new GroovyClassLoader());
                Global.info("Groovy Engine Initialization finished");
                if (SpringUtils.isSpring()) {
                    engine.put("ctx", SpringUtils.getSpringBootApplicationContext());
                }
            } catch (Exception e) {
                Global.error("Could not load Groovy Engine", e);
            }
        } else {
            try {
                cl = new WGroovyClassLoader(Global.getClassLoader());
            } catch (Exception e) {
                Global.error("Could not init Groovy Classloader", e);
            }
        }
    }
    public static Object eval(String script) throws Exception {
        if (cl != null) {
            Thread.currentThread().setContextClassLoader(cl);
            Class<?> bundle = cl.loadClass(GroovyBundle.class.getName());
            return bundle.getDeclaredMethod("eval", String.class).invoke(null, script);
        }
        return engine.eval(script);
    }
}
```
## 方案三
方案二有个bug，当我们的宿主jar也引入了`jsr223`或其他`Groovy-Module`的时候可能会报错，因为Groovy运行时，有个必要的`MetaClassRegisterImpl`类，构造方法中，会进行`ExtensionModuleScanner#scan`扫描可以自动注入的扩展模块，扫描的路径如下。

![image](https://i.imgur.com/W5KWpvG.png)

就会扫描到`jsr223`下的这个文件

![image](https://i.imgur.com/at6IGm7.png)

同时如果hostjar中也引入了不同版本的`jsr223`，通过`getResources`也是能获取到的，因为`getResources`也是委托的形式，到parent中也会查找一遍。这样就会加载多个不同版本的`jsr223`，多个版本就会导致报错，如下：

![image](https://i.imgur.com/oEsEUXL.png)

一个比较简单的解决方案就是，把`WGroovyClassLoader`的`getResource、getResources`方法给改了，改成直接调用`findResource findResources`方法。

## 方案四
还是基于方案二中的bug，另一个改造方案就是修改`WGroovyClassLoader`，入参中传入的`springCL`不赋值到`this.parent`，而是把他作为一个普通的`delegate`字段，把`parent`指向`ext`或者`bootstrap classloader`即可。然后重写`loadClass`:
```java :WGroovyClassLoader
class WGroovyClassLoader extends URLClassLoader {
    private final ClassLoader delegate;
    public WGroovyClassLoader(ClassLoader delegate) throws Exception {
        super(new URL[] { currentUrl() }, ClassLoader.getSystemClassLoader().getParent());
        this.delegate = delegate;
    }
    @Override
    public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        if (name.startsWith("w.") && !name.equals(GroovyBundle.class.getName())) {
            return delegate.loadClass(name);
        }
        try {
            Class<?> c = findLoadedClass(name);
            if (c != null) return c;
            c = findClass(name);
            return c;
        } catch (ClassNotFoundException e) {
            return delegate.loadClass(name);
        }
    }
}
```
整体的关系就变成了下面这样，这里把`SpringCL`作为`WGroovyCL`的一个普通属性，在`loadClass`中打破了委派关系，变成由`springCL`加载`w`开头的类，然后由当前类加载器在`swapper.jar`中优先查找并加载，找不到的由`springCL`兜底加载。

![image](https://i.imgur.com/OnFDPSb.png)
## 方案五
方案二有bug，方案三和方案四是两种解决bug的思路。但是他们都有一个无法避免的问题，就是如果宿主jar用的`groovy`版本和`swapper`的`groovy`版本有冲突的话，宿主jar加载类的时候，会先委托给`app classloader`，然后就使用到我们的`swapper`中的类了。

为了实现真正的隔离，又不改包名，那么可以把`groovy`的几个jar包放到`swapper.jar!/W-INF/lib!`下，来效仿`springboot`的打包方式。这里写一个`JarInJarClassLoader`专门加载`swapper.jar/W-INF/lib!/`下的jar包，他的`parent`直接指向`Ext`或者`NUll`，来保证这个类加载器只能加载`swapper.jar!/W-INF/lib!`下的jar包。

这里继续用`WGroovyClassLoader`来加载`GroovyBundle`，把他的`parent`指向`JarInJarClassLoader`，这样`GroovyBundle`启动的时候可以调用`jarinjar`中的`groovy`类。然后还需要把`delegate`指向`springCL`：
```java :WGroovyClassLoader.java
public static class WGroovyClassLoader extends URLClassLoader {
    private final ClassLoader delegate;
    public WGroovyClassLoader(ClassLoader parent, ClassLoader delegate) throws Exception {
        super(new URL[] { currentUrl() }, parent);
        this.delegate = Global.getClassLoader();
    }
    @Override
    public Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        // For entrypoint class, must load it by self
        if (name.equals(GroovyBundle.class.getName())) {
            Class<?> c = findLoadedClass(name);
            if (c != null) return c;
            return findClass(name);
        }
        try {
            // For groovy, need to load it by parent(jarInJarClassLoader)
            return getParent().loadClass(name);
        } catch (ClassNotFoundException e) {
            // Else load it by delegate(Global.getClassLoader())
            return delegate.loadClass(name);
        }
    }
}
```
`JarInJarClassLoader`的实现参考[JarInJarClassLoader.java](https://github.com/sunwu51/JVMByteSwapTool/blob/master/src/main/java/w/util/JarInJarClassLoader.java)，这里不再赘述了，加载器的关系如下：

![image](https://i.imgur.com/PfJB1q5.png)

这里把`groovy`相关的三个依赖都打包到`W-INF/lib!/`下的方式如下：
```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-dependency-plugin</artifactId>
	<version>3.3.0</version>
	<executions>
		<execution>
			<id>copy-dependencies</id>
			<phase>prepare-package</phase>
			<goals>
				<goal>copy-dependencies</goal>
			</goals>
			<configuration>
				<outputDirectory>${project.build.directory}/classes/W-INF/lib</outputDirectory>
				<includeGroupIds>org.apache.groovy</includeGroupIds>
				<overWriteReleases>false</overWriteReleases>
				<overWriteSnapshots>false</overWriteSnapshots>
				<overWriteIfNewer>true</overWriteIfNewer>
			</configuration>
		</execution>
	</executions>
</plugin>
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-shade-plugin</artifactId>
	<version>3.5.0</version>
	<configuration>
		<artifactSet>
			<excludes>
				<exclude>org.apache.groovy:*</exclude>
			</excludes>
	    </artifactSet>
	</configuration>
	<!-- 省略 其他配置 -->
</plugin>
```